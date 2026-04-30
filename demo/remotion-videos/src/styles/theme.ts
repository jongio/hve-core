export const THEME = {
  bg: { primary: "#0a0a1a", secondary: "#111128", card: "#1a1a2e" },
  text: { primary: "#f0f0f5", secondary: "#8888a0", muted: "#555570" },
  font: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  radius: 12,
  spacing: { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 },
} as const;

const SEMESTER_ACCENTS: Record<number, string> = {
  1: "#3b82f6", // Blue — Foundations
  2: "#8b5cf6", // Purple — Core Components
  3: "#f59e0b", // Amber — Building and Customizing
  4: "#10b981", // Emerald — Mastery
};

export function getSemesterAccent(semester: number): string {
  return SEMESTER_ACCENTS[semester] ?? SEMESTER_ACCENTS[1];
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
