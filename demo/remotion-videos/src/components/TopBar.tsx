import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../styles/theme";

interface TopBarProps {
  semesterName: string;
  episodeCode: string;
  accentColor: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  semesterName,
  episodeCode,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: THEME.spacing.lg,
        paddingRight: THEME.spacing.lg,
        backgroundColor: "rgba(10, 10, 26, 0.7)",
        borderBottom: `2px solid ${accentColor}`,
        opacity,
        fontFamily: THEME.font.heading,
        fontSize: 18,
        color: THEME.text.secondary,
      }}
    >
      <span>{semesterName}</span>
      <span>{episodeCode}</span>
    </div>
  );
};
