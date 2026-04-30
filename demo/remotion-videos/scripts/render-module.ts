/**
 * Render a single module video.
 *
 * Pipeline:
 *   1. Remotion renders video-only (no audio — Remotion's audio embedding is unreliable)
 *   2. ffmpeg muxes the module WAV audio into the final MP4
 *
 * Usage: npx tsx scripts/render-module.ts <moduleNum> [--preview]
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function main(): void {
  const args = process.argv.slice(2);

  const numArg = args.find((a) => !a.startsWith("--"));
  if (!numArg || isNaN(Number(numArg))) {
    console.error(
      "Usage: npx tsx scripts/render-module.ts <moduleNum> [--preview]",
    );
    process.exit(1);
  }

  const moduleNum = parseInt(numArg, 10);
  const preview = args.includes("--preview");
  const compositionId = `Module${pad(moduleNum)}`;
  const nn = pad(moduleNum);

  const videoDir = path.resolve(process.cwd(), "..", "site", "videos");
  const audioDir = path.resolve(process.cwd(), "public", "audio");
  const audioPath = path.join(audioDir, `module-${nn}.wav`);
  const finalPath = path.join(videoDir, `module-${nn}.mp4`);

  // Step 1: Render video-only from Remotion
  const videoOnlyPath = path.join(videoDir, `module-${nn}-video-only.mp4`);
  let renderCmd: string;

  if (preview) {
    renderCmd = `npx remotion render ${compositionId} --frames=0-1800 --output "${videoOnlyPath}"`;
  } else {
    renderCmd = `npx remotion render ${compositionId} --codec h264 --crf 18 --output "${videoOnlyPath}"`;
  }

  console.log(
    `[1/2] Rendering ${compositionId}${preview ? " (preview)" : ""}...`,
  );
  console.log(`  Video-only → ${videoOnlyPath}\n`);

  try {
    execSync(renderCmd, { stdio: "inherit" });
  } catch {
    console.error(`\n✗ Render failed for ${compositionId}`);
    process.exit(1);
  }

  // Step 2: Mux audio with ffmpeg
  if (!fs.existsSync(audioPath)) {
    console.warn(
      `\n⚠ No audio file at ${audioPath} — output will be video-only`,
    );
    fs.renameSync(videoOnlyPath, finalPath);
  } else {
    console.log(`\n[2/2] Muxing audio → ${finalPath}`);
    const muxCmd = [
      "ffmpeg -y",
      `-i "${videoOnlyPath}"`,
      `-i "${audioPath}"`,
      "-c:v copy -c:a aac -b:a 192k",
      "-map 0:v -map 1:a",
      "-movflags +faststart",
      `"${finalPath}"`,
    ].join(" ");

    try {
      execSync(muxCmd, { stdio: "inherit" });
      // Clean up video-only intermediate
      fs.unlinkSync(videoOnlyPath);
      console.log(`\n✓ Complete: ${finalPath}`);
    } catch {
      console.error(`\n✗ ffmpeg mux failed for module ${nn}`);
      process.exit(1);
    }
  }
}

main();
