import fs from "fs";
import path from "path";
import type { ModuleData, ModuleSection } from "../src/types.js";

const ROOT = path.resolve(process.cwd(), "..");
const OUT = path.resolve(process.cwd(), "src", "data", "modules.json");

const SEMESTER_DIRS = [
  "semester-1-foundations",
  "semester-2-artifact-types",
  "semester-3-authoring",
  "semester-4-operations",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseSectionType(
  heading: string,
): Pick<ModuleSection, "type" | "title" | "id"> {
  const trimmed = heading.trim();

  if (trimmed === "Intro") {
    return { type: "intro", title: "Intro", id: "intro" };
  }
  if (trimmed === "Objectives") {
    return { type: "objectives", title: "Objectives", id: "objectives" };
  }
  if (trimmed === "Outro") {
    return { type: "outro", title: "Outro", id: "outro" };
  }
  if (trimmed.startsWith("Content:")) {
    const title = trimmed.slice("Content:".length).trim();
    return { type: "content", title, id: slugify(title) };
  }
  if (trimmed.startsWith("Diagram:")) {
    const id = trimmed.slice("Diagram:".length).trim();
    return { type: "diagram", title: id, id: slugify(id) };
  }
  return { type: "content", title: trimmed, id: slugify(trimmed) };
}

function parseModuleFile(filePath: string): ModuleData {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n");

  // Extract module number and title from first heading
  const h1Match = lines
    .find((l) => l.startsWith("# Module "))
    ?.match(/^# Module (\d+):\s*(.+)/);
  if (!h1Match) {
    throw new Error(`No "# Module NN: Title" heading in ${filePath}`);
  }
  const moduleNum = parseInt(h1Match[1], 10);
  const title = h1Match[2].trim();

  // Extract semester info from episode line
  const epMatch = lines
    .find((l) => l.startsWith("## Episode"))
    ?.match(/## Episode (\d+)\s*\|\s*Semester (\d+):\s*(.+)/);
  if (!epMatch) {
    throw new Error(`No episode/semester heading in ${filePath}`);
  }
  const episodeCode = `E${epMatch[1].padStart(2, "0")}`;
  const semester = parseInt(epMatch[2], 10);
  const semesterName = epMatch[3].trim();

  // Extract learning objectives
  const objStart = lines.findIndex((l) =>
    l.trim().startsWith("### Learning Objectives"),
  );
  const objectives: string[] = [];
  if (objStart !== -1) {
    for (let i = objStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("###") || line.startsWith("####")) break;
      if (line.startsWith("- ")) {
        objectives.push(line.slice(2).trim());
      }
    }
  }

  // Split narration into sections at #### markers
  const narrationStart = lines.findIndex((l) =>
    l.trim().startsWith("### Narration Script"),
  );
  const sections: ModuleSection[] = [];
  const narrationParts: string[] = [];

  if (narrationStart !== -1) {
    let currentSection: (Pick<ModuleSection, "type" | "title" | "id"> & {
      lines: string[];
    }) | null = null;
    let sectionIndex = 0;

    for (let i = narrationStart + 1; i < lines.length; i++) {
      const line = lines[i];
      // Stop at next H3 section
      if (
        line.trim().startsWith("### ") &&
        !line.trim().startsWith("### Narration")
      ) {
        break;
      }
      if (line.trim().startsWith("#### ")) {
        // Flush previous section
        if (currentSection) {
          const text = currentSection.lines.join("\n").trim();
          sections.push({
            id: currentSection.id,
            index: sectionIndex,
            type: currentSection.type,
            title: currentSection.title,
            text,
          });
          narrationParts.push(text);
          sectionIndex++;
        }
        const heading = line.trim().slice("#### ".length);
        currentSection = { ...parseSectionType(heading), lines: [] };
      } else if (currentSection) {
        currentSection.lines.push(line);
      }
    }
    // Flush last section
    if (currentSection) {
      const text = currentSection.lines.join("\n").trim();
      sections.push({
        id: currentSection.id,
        index: sectionIndex,
        type: currentSection.type,
        title: currentSection.title,
        text,
      });
      narrationParts.push(text);
    }
  }

  // Extract talking points
  const tpStart = lines.findIndex((l) =>
    l.trim().startsWith("### Key Talking Points"),
  );
  const talkingPoints: string[] = [];
  if (tpStart !== -1) {
    for (let i = tpStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("###") || line.startsWith("####")) break;
      if (line.startsWith("- ")) {
        talkingPoints.push(line.slice(2).trim());
      }
    }
  }

  return {
    moduleNum,
    title,
    semester,
    semesterName,
    episodeCode,
    objectives,
    sections,
    talkingPoints,
    narration: narrationParts.join("\n\n"),
  };
}

function main(): void {
  const mdFiles: { num: number; filePath: string }[] = [];

  for (const dir of SEMESTER_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const numMatch = file.match(/^(\d+)-/);
      if (numMatch) {
        mdFiles.push({
          num: parseInt(numMatch[1], 10),
          filePath: path.join(dirPath, file),
        });
      }
    }
  }

  mdFiles.sort((a, b) => a.num - b.num);

  const modules: ModuleData[] = mdFiles.map((entry) =>
    parseModuleFile(entry.filePath),
  );

  const outDir = path.dirname(OUT);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(OUT, JSON.stringify(modules, null, 2), "utf-8");

  console.log(`Parsed ${modules.length} modules → ${OUT}`);
}

main();
