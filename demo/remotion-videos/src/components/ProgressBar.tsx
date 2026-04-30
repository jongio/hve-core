import React from "react";
import { useCurrentFrame } from "remotion";
import { THEME } from "../styles/theme";

interface ProgressBarProps {
  durationInFrames: number;
  accentColor: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  durationInFrames,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const progress =
    durationInFrames > 0
      ? Math.min((frame / durationInFrames) * 100, 100)
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 4,
        backgroundColor: THEME.bg.card,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: accentColor,
        }}
      />
    </div>
  );
};
