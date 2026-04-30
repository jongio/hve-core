import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface ContentSceneProps {
  points: string[];
  groupIndex: number;
  totalGroups: number;
  accentColor: string;
  durationInFrames: number;
}

export const ContentScene: React.FC<ContentSceneProps> = ({
  points,
  groupIndex,
  totalGroups,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        paddingLeft: 160,
        paddingRight: 160,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 80,
          fontFamily: THEME.font.body,
          fontSize: 18,
          color: THEME.text.muted,
          opacity: labelOpacity,
        }}
      >
        Part {groupIndex + 1} of {totalGroups}
      </div>

      <div
        style={{
          backgroundColor: THEME.bg.card,
          borderRadius: THEME.radius,
          padding: THEME.spacing.xl,
        }}
      >
        {points.map((point, i) => {
          const entryStart = 10 + i * 15;
          const opacity = interpolate(
            frame,
            [entryStart, entryStart + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const translateY = interpolate(
            frame,
            [entryStart, entryStart + 15],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: THEME.spacing.md,
                marginBottom: i < points.length - 1 ? THEME.spacing.lg : 0,
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: THEME.font.heading,
                  fontSize: 20,
                  fontWeight: 700,
                  color: THEME.bg.primary,
                  flexShrink: 0,
                }}
              >
                {groupIndex * 3 + i + 1}
              </div>
              <span
                style={{
                  fontFamily: THEME.font.body,
                  fontSize: 26,
                  color: THEME.text.primary,
                  lineHeight: 1.5,
                  paddingTop: 4,
                }}
              >
                {point}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
