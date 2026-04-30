import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import type { ModuleData, ModuleTimecodes, SectionTimecode } from "../src/types.js";

const DATA_PATH = path.resolve(process.cwd(), "src", "data", "modules.json");
const AUDIO_DIR = path.resolve(process.cwd(), "public", "audio");
const CACHE_FILE = path.join(AUDIO_DIR, ".audio-cache.json");
const MAX_CHUNK_CHARS = 1900;
const TTS_RETRIES = 3;

interface CacheEntry {
  hash: string;
  durationMs: number;
}

type AudioCache = Record<string, CacheEntry>;

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text, "utf-8").digest("hex");
}

function loadCache(): AudioCache {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as AudioCache;
  }
  return {};
}

function saveCache(cache: AudioCache): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Split text at paragraph/sentence boundaries to stay under maxLen chars per chunk. */
function chunkText(text: string, maxLen: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 2 <= maxLen) {
      current = current ? `${current}\n\n${para}` : para;
    } else if (para.length <= maxLen) {
      if (current) chunks.push(current);
      current = para;
    } else {
      // Paragraph too long — split on sentence boundaries
      if (current) {
        chunks.push(current);
        current = "";
      }
      const sentences = para.match(/[^.!?]+[.!?]+\s*/g) ?? [para];
      for (const sentence of sentences) {
        if (current.length + sentence.length <= maxLen) {
          current += sentence;
        } else {
          if (current) chunks.push(current.trim());
          current = sentence;
        }
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function getDurationMs(wavPath: string): number {
  try {
    const raw = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${wavPath}"`,
      { encoding: "utf-8" },
    ).trim();
    const seconds = parseFloat(raw);
    if (isNaN(seconds) || seconds <= 0) return 0;
    return Math.round(seconds * 1000);
  } catch {
    return 0;
  }
}

function generateSilence(outputPath: string, durationSec: number): void {
  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ${durationSec} "${outputPath}"`,
    { stdio: "pipe" },
  );
}

function synthChunk(textFile: string, outputWav: string): boolean {
  for (let attempt = 0; attempt < TTS_RETRIES; attempt++) {
    try {
      execSync(`voice synth "${textFile}" -o "${outputWav}"`, {
        stdio: "pipe",
        timeout: 120_000,
      });
      const dur = getDurationMs(outputWav);
      if (dur > 0) return true;
      // Zero duration — retry
      console.warn(
        `  ⚠ Zero duration on attempt ${attempt + 1}, retrying...`,
      );
    } catch (err) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(
        `  ⚠ TTS attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
      );
      execSync(`powershell -Command "Start-Sleep -Milliseconds ${delay}"`, {
        stdio: "pipe",
      });
    }
  }
  return false;
}

function concatWavFiles(fileList: string[], outputPath: string): boolean {
  if (fileList.length === 1) {
    fs.copyFileSync(fileList[0], outputPath);
    return true;
  }

  const listPath = outputPath.replace(/\.wav$/, "-concat-list.txt");
  const listContent = fileList.map((f) => `file '${f}'`).join("\n");
  fs.writeFileSync(listPath, listContent, "utf-8");

  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
      { stdio: "pipe" },
    );
    fs.unlinkSync(listPath);
    return true;
  } catch {
    fs.unlinkSync(listPath);
    // Fallback: use first chunk only
    if (fileList.length > 0) {
      fs.copyFileSync(fileList[0], outputPath);
    }
    return false;
  }
}

function processModule(mod: ModuleData, cache: AudioCache): void {
  const modDir = path.join(AUDIO_DIR, `module-${pad(mod.moduleNum)}`);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
  }

  const sectionTimecodes: SectionTimecode[] = [];
  const sectionWavPaths: string[] = [];
  let cumulativeMs = 0;

  for (const section of mod.sections) {
    const sectionFile = path.join(
      modDir,
      `${pad(section.index)}-${section.id}.wav`,
    );
    const hash = sha256(section.text);
    const cacheKey = `m${pad(mod.moduleNum)}-s${pad(section.index)}`;

    // Check cache
    if (
      cache[cacheKey]?.hash === hash &&
      fs.existsSync(sectionFile) &&
      getDurationMs(sectionFile) > 0
    ) {
      console.log(`  ✓ ${cacheKey} cached`);
      const durationMs = cache[cacheKey].durationMs;
      sectionTimecodes.push({
        id: section.id,
        index: section.index,
        type: section.type,
        title: section.title,
        startMs: cumulativeMs,
        endMs: cumulativeMs + durationMs,
        durationMs,
        audioFile: path.relative(AUDIO_DIR, sectionFile).replace(/\\/g, "/"),
      });
      sectionWavPaths.push(sectionFile);
      cumulativeMs += durationMs;
      continue;
    }

    console.log(`  ⏳ Synthesizing ${cacheKey}: ${section.title}`);
    const chunks = chunkText(section.text, MAX_CHUNK_CHARS);
    const chunkPaths: string[] = [];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunkTxt = path.join(modDir, `${cacheKey}-chunk-${ci}.txt`);
      const chunkWav = path.join(modDir, `${cacheKey}-chunk-${ci}.wav`);
      fs.writeFileSync(chunkTxt, chunks[ci], "utf-8");

      const ok = synthChunk(chunkTxt, chunkWav);
      if (!ok) {
        console.warn(`  ✗ Generating 10s silence for chunk ${ci}`);
        generateSilence(chunkWav, 10);
      }
      chunkPaths.push(chunkWav);

      // Clean up text file
      if (fs.existsSync(chunkTxt)) fs.unlinkSync(chunkTxt);
    }

    concatWavFiles(chunkPaths, sectionFile);

    // Clean up chunk wav files
    for (const cp of chunkPaths) {
      if (cp !== sectionFile && fs.existsSync(cp)) fs.unlinkSync(cp);
    }

    let durationMs = getDurationMs(sectionFile);
    if (durationMs <= 0) {
      console.warn(`  ✗ Re-synthesizing ${cacheKey} after zero duration`);
      const fallbackTxt = path.join(modDir, `${cacheKey}-retry.txt`);
      fs.writeFileSync(fallbackTxt, section.text.slice(0, MAX_CHUNK_CHARS), "utf-8");
      const ok = synthChunk(fallbackTxt, sectionFile);
      if (fs.existsSync(fallbackTxt)) fs.unlinkSync(fallbackTxt);
      if (!ok) generateSilence(sectionFile, 10);
      durationMs = getDurationMs(sectionFile);
      if (durationMs <= 0) durationMs = 10_000;
    }

    cache[cacheKey] = { hash, durationMs };
    saveCache(cache);

    sectionTimecodes.push({
      id: section.id,
      index: section.index,
      type: section.type,
      title: section.title,
      startMs: cumulativeMs,
      endMs: cumulativeMs + durationMs,
      durationMs,
      audioFile: path.relative(AUDIO_DIR, sectionFile).replace(/\\/g, "/"),
    });
    sectionWavPaths.push(sectionFile);
    cumulativeMs += durationMs;
  }

  // Concatenate all sections into single module WAV
  const fullWav = path.join(AUDIO_DIR, `module-${pad(mod.moduleNum)}.wav`);
  if (sectionWavPaths.length > 0) {
    concatWavFiles(sectionWavPaths, fullWav);
  }

  // Write timecodes
  const timecodes: ModuleTimecodes = {
    moduleNum: mod.moduleNum,
    sections: sectionTimecodes,
    totalDurationMs: cumulativeMs,
  };
  const tcPath = path.join(
    AUDIO_DIR,
    `module-${pad(mod.moduleNum)}-timecodes.json`,
  );
  fs.writeFileSync(tcPath, JSON.stringify(timecodes, null, 2), "utf-8");
  console.log(
    `  ✓ Module ${pad(mod.moduleNum)} — ${sectionTimecodes.length} sections, ${(cumulativeMs / 1000).toFixed(1)}s total`,
  );
}

function main(): void {
  if (!fs.existsSync(DATA_PATH)) {
    console.error("modules.json not found. Run parse-and-cache.ts first.");
    process.exit(1);
  }

  const modules: ModuleData[] = JSON.parse(
    fs.readFileSync(DATA_PATH, "utf-8"),
  );

  const args = process.argv.slice(2).map(Number);
  let start = 1;
  let end = modules.length > 0 ? modules[modules.length - 1].moduleNum : 20;

  if (args.length === 1 && !isNaN(args[0])) {
    start = end = args[0];
  } else if (args.length >= 2 && !isNaN(args[0]) && !isNaN(args[1])) {
    start = args[0];
    end = args[1];
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const cache = loadCache();

  const filtered = modules.filter(
    (m) => m.moduleNum >= start && m.moduleNum <= end,
  );

  console.log(`Generating audio for modules ${start}–${end} (${filtered.length} modules)\n`);

  for (const mod of filtered) {
    console.log(`Module ${pad(mod.moduleNum)}: ${mod.title}`);
    processModule(mod, cache);
    console.log();
  }

  console.log("Audio generation complete.");
}

main();
