import { AbsoluteFill, Audio, OffthreadVideo, Sequence } from "remotion";
import React from "react";

// Én scene = ett Veo-klipp (hånd som tegner motivet) + norsk voiceover.
export interface VeoScene {
  videoUrl: string;
  audioUrl?: string;
  durationInFrames: number;
  playbackRate?: number;
}

export interface VeoProps {
  scenes: VeoScene[];
  fps: number;
  totalFrames: number;
}

// Setter Veo-klippene etter hverandre til én vertikal video, hver med sin
// stemme. Klippet fyller hele flaten (whiteboard-motivet er allerede tegnet av
// Veo), på ren hvit bakgrunn slik at eventuell luft ser ut som tavla.
export const VeoComposition: React.FC<VeoProps> = ({ scenes = [] }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {scenes.map((s, i) => {
        const start = from;
        from += Math.max(1, s.durationInFrames);
        return (
          <Sequence key={i} from={start} durationInFrames={Math.max(1, s.durationInFrames)}>
            <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
              <OffthreadVideo
                src={s.videoUrl}
                playbackRate={s.playbackRate && s.playbackRate > 0 ? s.playbackRate : 1}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
            {s.audioUrl ? <Audio src={s.audioUrl} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
