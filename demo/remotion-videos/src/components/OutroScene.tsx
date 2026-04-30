import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface OutroSceneProps {
  title: string;
  nextModuleTitle?: string;
  nextModuleNum?: number;
  accentColor: string;
  durationInFrames: number;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  title,
  nextModuleTitle,
  nextModuleNum,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          fontFamily: THEME.font.heading,
          fontSize: 52,
          fontWeight: 700,
          color: THEME.text.primary,
          textAlign: "center",
          maxWidth: 1200,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity: ctaOpacity,
          marginTop: THEME.spacing.xl,
          fontFamily: THEME.font.body,
          fontSize: 30,
          color: THEME.text.secondary,
          textAlign: "center",
        }}
      >
        {nextModuleTitle != null && nextModuleNum != null ? (
          <>
            Next: Module {nextModuleNum}{" "}
            <span style={{ color: accentColor }}>→</span> {nextModuleTitle}
          </>
        ) : (
          <span style={{ color: accentColor }}>Course Complete</span>
        )}
      </div>
    </AbsoluteFill>
  );
};
