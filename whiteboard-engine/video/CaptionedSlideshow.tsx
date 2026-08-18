import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame, interpolate } from "remotion";
import React from "react";

// LME VideoFlow: one scene = one styled still image (Ken Burns pan/zoom) +
// voiceover + word-level karaoke captions burned in, built from ElevenLabs
// with-timestamps data (functions/_lib/videoflow-providers.js
// voiceGenerateLine). Reuses the same Ken Burns approach as
// SlideshowVideo.tsx (YouTube app), captions are the new part.
//
// Premium tier (functions/api/videoflow/scene-video.js): a scene can
// optionally carry a ready Higgsfield-animated clip instead of its still.
// When videoUrl is present we play that (muted, its own voiceover Audio
// track still layered on top) instead of the Ken Burns pan/zoom.
export interface CaptionWord { word: string; start: number; end: number; }

export interface CaptionedScene {
  imageUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  durationInFrames: number;
  words?: CaptionWord[];
}

export interface CaptionedProps {
  scenes: CaptionedScene[];
  fps: number;
  totalFrames: number;
  aspect?: "16:9" | "9:16";
}

const KenBurnsImage: React.FC<{ src: string; durationInFrames: number; direction: number }> = ({
  src,
  durationInFrames,
  direction,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames)], [1.0, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shiftX = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, direction * 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Img
      src={src}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale}) translateX(${shiftX}px)` }}
    />
  );
};

// Rolling window of a few words around whatever is being said right now,
// active word highlighted, karaoke-style. Word timestamps are relative to
// the scene's own audio start, which lines up with useCurrentFrame() here
// because this component only ever renders nested inside that scene's
// own <Sequence> (frame 0 = scene start).
const Captions: React.FC<{ words: CaptionWord[]; fps: number }> = ({ words, fps }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  if (!words || !words.length) return null;

  let activeIndex = words.findIndex((w) => t >= w.start && t <= w.end);
  if (activeIndex === -1) {
    activeIndex = words.findIndex((w) => t < w.start);
    if (activeIndex === -1) activeIndex = words.length - 1;
  }
  const windowSize = 5;
  let start = Math.max(0, activeIndex - Math.floor(windowSize / 2));
  const end = Math.min(words.length, start + windowSize);
  start = Math.max(0, end - windowSize);
  const visible = words.slice(start, end);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", maxWidth: "86%" }}>
        {visible.map((w, i) => {
          const idx = start + i;
          const active = idx === activeIndex;
          return (
            <span
              key={idx}
              style={{
                fontFamily: "Arial, sans-serif",
                fontWeight: 900,
                fontSize: active ? 58 : 50,
                color: active ? "#FFE94A" : "#FFFFFF",
                textShadow: "0 3px 0 rgba(0,0,0,.55), 0 0 18px rgba(0,0,0,.35)",
                WebkitTextStroke: active ? "2px rgba(0,0,0,.35)" : "1.5px rgba(0,0,0,.3)",
                textTransform: "uppercase",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionedSlideshow: React.FC<CaptionedProps> = ({ scenes = [], fps }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {scenes.map((s, i) => {
        const start = from;
        const dur = Math.max(1, s.durationInFrames);
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <AbsoluteFill>
              {s.videoUrl ? (
                <OffthreadVideo src={s.videoUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <KenBurnsImage src={s.imageUrl} durationInFrames={dur} direction={i % 2 === 0 ? 1 : -1} />
              )}
              {s.words && s.words.length ? <Captions words={s.words} fps={fps} /> : null}
            </AbsoluteFill>
            {s.audioUrl ? <Audio src={s.audioUrl} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
