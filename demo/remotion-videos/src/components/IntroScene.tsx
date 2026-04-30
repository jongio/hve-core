import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { THEME } from "../styles/theme";

interface IntroSceneProps {
  title: string;
  episodeCode: string;
  semesterName: string;
  accentColor: string;
  durationInFrames: number;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  title,
  episodeCode,
  semesterName,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
    from: 0.7,
    to: 1,
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subOffset = interpolate(frame, [15, 35], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = title.split(" ");
  const firstWord = words[0];
  const rest = words.slice(1).join(" ");

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          fontFamily: THEME.font.heading,
          fontSize: 72,
          fontWeight: 700,
          color: THEME.text.primary,
          textAlign: "center",
          maxWidth: 1400,
          lineHeight: 1.2,
        }}
      >
        <span style={{ color: accentColor }}>{firstWord}</span>
        {rest ? ` ${rest}` : ""}
      </div>
      <div
        style={{
          transform: `translateY(${subOffset}px)`,
          opacity: subOpacity,
          marginTop: THEME.spacing.lg,
          fontFamily: THEME.font.body,
          fontSize: 28,
          color: THEME.text.secondary,
          textAlign: "center",
        }}
      >
        {episodeCode} · {semesterName}
      </div>
    </AbsoluteFill>
  );
};
