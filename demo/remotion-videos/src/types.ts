export const FPS = 30;

export interface ModuleSection {
  id: string;
  index: number;
  type: "intro" | "objectives" | "content" | "diagram" | "outro";
  title: string;
  text: string;
}

export interface ModuleData {
  moduleNum: number;
  title: string;
  semester: number;
  semesterName: string;
  episodeCode: string;
  objectives: string[];
  sections: ModuleSection[];
  talkingPoints: string[];
  narration: string;
}

export interface SectionTimecode {
  id: string;
  index: number;
  type: string;
  title: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  audioFile: string;
}

export interface ModuleTimecodes {
  moduleNum: number;
  sections: SectionTimecode[];
  totalDurationMs: number;
}

export interface DiagramConfig {
  type: "architecture" | "timeline" | "comparison" | "flow" | "radar" | "block" | "benchmarkGrid";
  title: string;
  props: Record<string, unknown>;
}

export interface ModuleDiagrams {
  [moduleNum: number]: {
    [diagramId: string]: DiagramConfig;
  };
}
