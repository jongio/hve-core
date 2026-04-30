import React, { useEffect, useState } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
  staticFile,
} from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { THEME } from "../styles/theme";

type CaptionPages = ReturnType<typeof createTikTokStyleCaptions>["pages"];
type CaptionPage = CaptionPages[number];

interface CaptionOverlayProps {
  captionsFile: string;
  accentColor: string;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  captionsFile,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [pages, setPages] = useState<CaptionPages>([]);
  const [handle] = useState(() => delayRender("Loading captions"));

  useEffect(() => {
    let cancelled = false;

    fetch(staticFile(captionsFile))
      .then((res) => {
        if (!res.ok) throw new Error("Captions not found");
        return res.json();
      })
      .then((captions: unknown) => {
        if (cancelled) return;
        const result = createTikTokStyleCaptions({
          captions:
            captions as Parameters<
              typeof createTikTokStyleCaptions
            >[0]["captions"],
          combineTokensWithinMilliseconds: 600,
        });
        setPages(result.pages);
        continueRender(handle);
      })
      .catch(() => {
        if (cancelled) return;
        setPages([]);
        continueRender(handle);
      });

    return () => {
      cancelled = true;
    };
  }, [captionsFile, handle]);

  if (pages.length === 0) return null;

  const currentTimeMs = (frame / fps) * 1000;

  let activePage: CaptionPage | undefined;
  for (const p of pages) {
    if (p.startMs <= currentTimeMs) activePage = p;
  }

  if (!activePage) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        paddingBottom: "10%",
        paddingTop: 80,
        background: "linear-gradient(transparent, rgba(0, 0, 0, 0.75))",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          fontFamily: THEME.font.body,
          fontSize: 36,
          lineHeight: 1.4,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {activePage.tokens.map((token, i) => {
          const isActive =
            currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
          return (
            <span
              key={i}
              style={{
                color: isActive ? accentColor : THEME.text.primary,
                fontWeight: isActive ? 700 : 400,
                textShadow: isActive
                  ? `0 0 12px ${accentColor}`
                  : "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
