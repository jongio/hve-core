import { execSync } from "child_process";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function main(): void {
  const args = process.argv.slice(2).map(Number);

  let start = 1;
  let end = 20;

  if (args.length === 1 && !isNaN(args[0])) {
    start = end = args[0];
  } else if (args.length >= 2 && !isNaN(args[0]) && !isNaN(args[1])) {
    start = args[0];
    end = args[1];
  }

  const total = end - start + 1;
  console.log(`Rendering modules ${start}–${end} (${total} modules)\n`);

  for (let num = start; num <= end; num++) {
    const progress = num - start + 1;
    console.log(`\n[${"=".repeat(progress)}${".".repeat(total - progress)}] Module ${pad(num)} (${progress}/${total})`);

    try {
      execSync(`npx tsx scripts/render-module.ts ${num}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(`Rendered module ${num} of ${total}`);
    } catch {
      console.error(`✗ Module ${pad(num)} failed, continuing...`);
    }
  }

  console.log(`\n✓ Batch render complete (${start}–${end}).`);
}

main();
