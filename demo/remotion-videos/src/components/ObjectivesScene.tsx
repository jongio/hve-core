import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface ObjectivesSceneProps {
  objectives: string[];
  accentColor: string;
  durationInFrames: number;
}

export const ObjectivesScene: React.FC<ObjectivesSceneProps> = ({
  objectives,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        paddingLeft: 200,
        paddingRight: 200,
      }}
    >
      <div
        style={{
          fontFamily: THEME.font.heading,
          fontSize: 40,
          fontWeight: 700,
          color: accentColor,
          marginBottom: THEME.spacing.lg,
          opacity: headerOpacity,
        }}
      >
        Learning Objectives
      </div>

      {objectives.map((obj, i) => {
        const entryStart = 15 + i * 15;
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
              gap: THEME.spacing.sm,
              marginBottom: THEME.spacing.md,
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              style={{ flexShrink: 0, marginTop: 4 }}
            >
              <circle
                cx="14"
                cy="14"
                r="14"
                fill={accentColor}
                opacity={0.15}
              />
              <path
                d="M8 14.5l4 4 8-8"
                stroke={accentColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: THEME.font.body,
                fontSize: 28,
                color: THEME.text.primary,
                lineHeight: 1.5,
              }}
            >
              {obj}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
