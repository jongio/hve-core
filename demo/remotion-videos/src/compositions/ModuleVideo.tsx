import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { FPS, ModuleData } from "../types";
import { getSemesterAccent, pad } from "../styles/theme";

import { Background } from "../components/Background";
import { TopBar } from "../components/TopBar";
import { ProgressBar } from "../components/ProgressBar";
import { IntroScene } from "../components/IntroScene";
import { ObjectivesScene } from "../components/ObjectivesScene";
import { ContentScene } from "../components/ContentScene";
import { DiagramScene } from "../components/DiagramScene";
import { OutroScene } from "../components/OutroScene";
import { CaptionOverlay } from "../components/CaptionOverlay";

loadFont();
loadJetBrainsMono();

const FADE_FRAMES = 15;
const SLIDE_FRAMES = 20;

interface ModuleVideoProps {
  moduleData: ModuleData;
}

function buildSceneElements(
  moduleData: ModuleData,
  accentColor: string,
  durationInFrames: number,
): React.ReactNode[] {
  const introFrames = 6 * FPS;
  const objectivesFrames = (3 + moduleData.objectives.length * 3) * FPS;
  const outroFrames = 5 * FPS;
  const contentBaseFrames = 5 * FPS;
  const diagramFrames = 6 * FPS;

  // Split talking points into groups of 3
  const contentGroups: string[][] = [];
  for (let i = 0; i < moduleData.talkingPoints.length; i += 3) {
    contentGroups.push(moduleData.talkingPoints.slice(i, i + 3));
  }

  const diagramSections = moduleData.sections.filter(
    (s) => s.type === "diagram",
  );
  const middleCount = contentGroups.length + diagramSections.length;

  // Net duration = total scenes − transition overlaps
  const transitionOverlap =
    FADE_FRAMES + middleCount * SLIDE_FRAMES + FADE_FRAMES;
  const baseSceneTotal =
    introFrames +
    objectivesFrames +
    contentGroups.length * contentBaseFrames +
    diagramSections.length * diagramFrames +
    outroFrames;
  const baseNet = baseSceneTotal - transitionOverlap;

  // Distribute extra frames across content groups
  const extra = Math.max(0, durationInFrames - baseNet);
  const contentExtraEach =
    contentGroups.length > 0 ? Math.floor(extra / contentGroups.length) : 0;
  const contentFrames = contentBaseFrames + contentExtraEach;

  const elements: React.ReactNode[] = [];
  let k = 0;

  // ── Intro ──
  elements.push(
    <TransitionSeries.Sequence key={k++} durationInFrames={introFrames}>
      <IntroScene
        title={moduleData.title}
        episodeCode={moduleData.episodeCode}
        semesterName={moduleData.semesterName}
        accentColor={accentColor}
        durationInFrames={introFrames}
      />
    </TransitionSeries.Sequence>,
  );

  elements.push(
    <TransitionSeries.Transition
      key={k++}
      presentation={fade()}
      timing={linearTiming({ durationInFrames: FADE_FRAMES })}
    />,
  );

  // ── Objectives ──
  elements.push(
    <TransitionSeries.Sequence key={k++} durationInFrames={objectivesFrames}>
      <ObjectivesScene
        objectives={moduleData.objectives}
        accentColor={accentColor}
        durationInFrames={objectivesFrames}
      />
    </TransitionSeries.Sequence>,
  );

  // ── Content groups ──
  contentGroups.forEach((group, idx) => {
    elements.push(
      <TransitionSeries.Transition
        key={k++}
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: SLIDE_FRAMES,
        })}
      />,
    );

    elements.push(
      <TransitionSeries.Sequence key={k++} durationInFrames={contentFrames}>
        <ContentScene
          points={group}
          groupIndex={idx}
          totalGroups={contentGroups.length}
          accentColor={accentColor}
          durationInFrames={contentFrames}
        />
      </TransitionSeries.Sequence>,
    );
  });

  // ── Diagram sections ──
  diagramSections.forEach((section) => {
    elements.push(
      <TransitionSeries.Transition
        key={k++}
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: SLIDE_FRAMES,
        })}
      />,
    );

    elements.push(
      <TransitionSeries.Sequence key={k++} durationInFrames={diagramFrames}>
        <DiagramScene
          diagramId={section.id}
          diagramTitle={section.title}
          accentColor={accentColor}
          durationInFrames={diagramFrames}
        />
      </TransitionSeries.Sequence>,
    );
  });

  // ── Fade to outro ──
  elements.push(
    <TransitionSeries.Transition
      key={k++}
      presentation={fade()}
      timing={linearTiming({ durationInFrames: FADE_FRAMES })}
    />,
  );

  elements.push(
    <TransitionSeries.Sequence key={k++} durationInFrames={outroFrames}>
      <OutroScene
        title={moduleData.title}
        accentColor={accentColor}
        durationInFrames={outroFrames}
      />
    </TransitionSeries.Sequence>,
  );

  return elements;
}

export const ModuleVideo: React.FC<ModuleVideoProps> = ({ moduleData }) => {
  const { durationInFrames } = useVideoConfig();
  const accentColor = getSemesterAccent(moduleData.semester);
  const sceneElements = buildSceneElements(
    moduleData,
    accentColor,
    durationInFrames,
  );

  const audioSrc = staticFile(`audio/module-${pad(moduleData.moduleNum)}.wav`);

  return (
    <AbsoluteFill>
      {/* Audio track — full module WAV */}
      <Audio src={audioSrc} />

      {/* z0: Background */}
      <AbsoluteFill style={{ zIndex: 0 }}>
        <Background accentColor={accentColor} />
      </AbsoluteFill>

      {/* z2: TopBar */}
      <AbsoluteFill style={{ zIndex: 2 }}>
        <TopBar
          semesterName={moduleData.semesterName}
          episodeCode={moduleData.episodeCode}
          accentColor={accentColor}
        />
      </AbsoluteFill>

      {/* z5: ProgressBar */}
      <AbsoluteFill style={{ zIndex: 5 }}>
        <ProgressBar
          durationInFrames={durationInFrames}
          accentColor={accentColor}
        />
      </AbsoluteFill>

      {/* z10: Scene content via TransitionSeries */}
      <AbsoluteFill style={{ zIndex: 10 }}>
        <TransitionSeries>{sceneElements}</TransitionSeries>
      </AbsoluteFill>

      {/* z20: CaptionOverlay */}
      <AbsoluteFill style={{ zIndex: 20 }}>
        <CaptionOverlay
          captionsFile={`captions/module-${pad(moduleData.moduleNum)}.json`}
          accentColor={accentColor}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
