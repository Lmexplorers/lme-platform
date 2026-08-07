import { AbsoluteFill, Audio, OffthreadVideo, Sequence } from "remotion";
import React from "react";

// One dialogue/narration line's voice, placed at an offset inside its shot.
export interface EpisodeAudioTrack {
  url: string;
  startInFrames: number;
  durationInFrames: number;
}

// One approved, animated Mia & Teo shot (Higgsfield clip) + its voice lines.
export interface EpisodeShot {
  videoUrl: string;
  durationInFrames: number;
  audio: EpisodeAudioTrack[];
}

export interface EpisodeProps {
  shots: EpisodeShot[];
  fps: number;
  totalFrames: number;
  aspect?: "16:9" | "9:16";
}

// Mia & Teo Video Creator, final assembly: places each approved shot clip
// back to back and layers its dialogue/narration audio on top at the right
// offset. No background music yet (no music provider is wired up), no
// crossfades (hard cuts between shots), no burned-in subtitles yet, see
// docs/mia-teo-video-creator.md for what's still missing.
export const EpisodeComposition: React.FC<EpisodeProps> = ({ shots = [] }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {shots.map((shot, i) => {
        const start = from;
        const dur = Math.max(1, shot.durationInFrames);
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <AbsoluteFill>
              <OffthreadVideo
                src={shot.videoUrl}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
            {(shot.audio || []).map((track, j) => (
              <Sequence key={j} from={track.startInFrames} durationInFrames={Math.max(1, track.durationInFrames)}>
                <Audio src={track.url} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
