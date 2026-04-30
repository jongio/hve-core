import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface DiagramSceneProps {
  diagramId: string;
  diagramTitle: string;
  accentColor: string;
  durationInFrames: number;
}

export const DiagramScene: React.FC<DiagramSceneProps> = ({
  diagramId,
  diagramTitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: THEME.font.heading,
          fontSize: 40,
          fontWeight: 700,
          color: THEME.text.primary,
          marginBottom: THEME.spacing.sm,
          textAlign: "center",
        }}
      >
        {diagramTitle}
      </div>
      <div
        style={{
          width: 80,
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
          marginBottom: THEME.spacing.xl,
        }}
      />
      <div
        style={{
          width: 960,
          height: 540,
          border: `2px dashed ${THEME.text.muted}`,
          borderRadius: THEME.radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: THEME.font.mono,
          fontSize: 22,
          color: THEME.text.muted,
        }}
      >
        Diagram: {diagramId}
      </div>
    </AbsoluteFill>
  );
};
