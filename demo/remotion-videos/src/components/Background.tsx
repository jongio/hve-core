import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface BackgroundProps {
  accentColor: string;
}

export const Background: React.FC<BackgroundProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 40), [-1, 1], [0.06, 0.15]);

  return (
    <AbsoluteFill>
      <div
        style={{
          width: 1920,
          height: 1080,
          background: `radial-gradient(ellipse at center, ${THEME.bg.secondary} 0%, ${THEME.bg.primary} 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: accentColor,
          opacity: pulse,
          filter: "blur(120px)",
        }}
      />
    </AbsoluteFill>
  );
};
