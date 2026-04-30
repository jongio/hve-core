import React from "react";
import { Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { ModuleVideo } from "./compositions/ModuleVideo";
import { FPS, ModuleData } from "./types";
import { pad } from "./styles/theme";

import moduleDataJson from "./data/modules.json";

const moduleDataList: ModuleData[] = moduleDataJson as ModuleData[];

function estimateDurationFrames(mod: ModuleData): number {
  const wordCount = mod.narration.split(/\s+/).length;
  const estimatedSeconds = Math.max(30, (wordCount / 150) * 60);
  return Math.ceil(estimatedSeconds * FPS);
}

export const Root: React.FC = () => {
  return (
    <>
      {moduleDataList.map((mod) => (
        <Composition
          key={mod.moduleNum}
          id={`Module${pad(mod.moduleNum)}`}
          component={ModuleVideo as unknown as React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>}
          width={1920}
          height={1080}
          fps={FPS}
          durationInFrames={estimateDurationFrames(mod)}
          defaultProps={{ moduleData: mod }}
          calculateMetadata={async ({ props }) => {
            try {
              const modData = props.moduleData as ModuleData;
              const audioSrc = staticFile(
                `audio/module-${pad(modData.moduleNum)}.wav`
              );
              const duration = await getAudioDurationInSeconds(audioSrc);
              return { durationInFrames: Math.ceil(duration * FPS) };
            } catch {
              const modData = props.moduleData as ModuleData;
              return {
                durationInFrames: estimateDurationFrames(modData),
              };
            }
          }}
        />
      ))}
    </>
  );
};
