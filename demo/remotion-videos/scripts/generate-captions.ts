import fs from "fs";
import path from "path";
import type { ModuleData, ModuleTimecodes } from "../src/types.js";

const DATA_PATH = path.resolve(process.cwd(), "src", "data", "modules.json");
const AUDIO_DIR = path.resolve(process.cwd(), "public", "audio");

interface Caption {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Normalize smart quotes, strip emojis, and collapse whitespace. */
function sanitize(text: string): string {
  return (
    text
      // Smart quotes to ASCII
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Em/en dashes
      .replace(/[\u2013\u2014]/g, "-")
      // Ellipsis
      .replace(/\u2026/g, "...")
      // Strip emoji (supplementary plane characters)
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        "",
      )
      // Normalize whitespace within lines
      .replace(/[ \t]+/g, " ")
      .trim()
  );
}

/** Tokenize text into words, inserting [PARA] markers at paragraph breaks. */
function tokenize(text: string): string[] {
  const paragraphs = text.split(/\n\n+/);
  const tokens: string[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    if (pi > 0) tokens.push("[PARA]");
    const words = paragraphs[pi].trim().split(/\s+/).filter(Boolean);
    tokens.push(...words);
  }
  return tokens;
}

/** Estimate raw duration in ms for a word token. */
function estimateWordDuration(word: string): number {
  if (word === "[PARA]") return 500;

  const charCount = word.replace(/[^a-zA-Z0-9]/g, "").length || 1;
  const charFactor = Math.min(1.8, Math.max(0.6, charCount / 5));
  let duration = 400 * charFactor;

  const lastChar = word.slice(-1);
  if (".!?".includes(lastChar)) {
    duration += 250;
  } else if (",;:".includes(lastChar)) {
    duration += 80;
  }

  return duration;
}

function generateSectionCaptions(
  text: string,
  sectionStartMs: number,
  sectionDurationMs: number,
): Caption[] {
  const sanitized = sanitize(text);
  const tokens = tokenize(sanitized);
  if (tokens.length === 0) return [];

  // Compute raw durations
  const rawDurations = tokens.map(estimateWordDuration);
  const rawTotal = rawDurations.reduce((a, b) => a + b, 0);
  if (rawTotal <= 0) return [];

  // Scale to fit actual audio duration
  const scale = sectionDurationMs / rawTotal;
  const scaledDurations = rawDurations.map((d) => d * scale);

  const captions: Caption[] = [];
  let offset = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const dur = scaledDurations[i];

    if (token === "[PARA]") {
      // Paragraph pauses consume time but produce no visible caption
      offset += dur;
      continue;
    }

    const startMs = Math.round(sectionStartMs + offset);
    const endMs = Math.round(sectionStartMs + offset + dur);

    captions.push({
      text: token,
      startMs,
      endMs,
      timestampMs: startMs,
      confidence: null,
    });

    offset += dur;
  }

  return captions;
}

function processModule(mod: ModuleData): void {
  const tcPath = path.join(
    AUDIO_DIR,
    `module-${pad(mod.moduleNum)}-timecodes.json`,
  );
  if (!fs.existsSync(tcPath)) {
    console.warn(
      `  ⚠ Timecodes not found for module ${pad(mod.moduleNum)}, skipping`,
    );
    return;
  }

  const timecodes: ModuleTimecodes = JSON.parse(
    fs.readFileSync(tcPath, "utf-8"),
  );

  const allCaptions: Caption[] = [];

  for (const stc of timecodes.sections) {
    const section = mod.sections.find((s) => s.index === stc.index);
    if (!section) {
      console.warn(`  ⚠ No section data for index ${stc.index}, skipping`);
      continue;
    }

    const sectionCaptions = generateSectionCaptions(
      section.text,
      stc.startMs,
      stc.durationMs,
    );
    allCaptions.push(...sectionCaptions);
  }

  const outPath = path.join(
    AUDIO_DIR,
    `module-${pad(mod.moduleNum)}-captions.json`,
  );
  fs.writeFileSync(outPath, JSON.stringify(allCaptions, null, 2), "utf-8");
  console.log(
    `  ✓ Module ${pad(mod.moduleNum)} — ${allCaptions.length} caption words`,
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

  const args = process.argv.slice(2).map(Number).filter((n) => !isNaN(n));

  let targets: ModuleData[];
  if (args.length > 0) {
    const numSet = new Set(args);
    targets = modules.filter((m) => numSet.has(m.moduleNum));
  } else {
    targets = modules;
  }

  console.log(`Generating captions for ${targets.length} modules\n`);

  for (const mod of targets) {
    console.log(`Module ${pad(mod.moduleNum)}: ${mod.title}`);
    processModule(mod);
  }

  console.log("\nCaption generation complete.");
}

main();
