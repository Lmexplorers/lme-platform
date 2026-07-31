import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, interpolate } from "remotion";
import React from "react";

// Én scene = ett stillbilde (Ken Burns pan/zoom) + voiceover for det kapittelet.
// Enklere og raskere/rimeligere enn VeoComposition (ingen Veo-videoklipp per
// scene), brukt til YouTube-appens "lag video"-funksjon: bilde + AI-stemme
// per kapittel i stedet for en animert tegning.
export interface SlideshowScene {
  imageUrl: string;
  audioUrl?: string;
  durationInFrames: number;
  onScreenText?: string;
}

export interface SlideshowProps {
  scenes: SlideshowScene[];
  fps: number;
  totalFrames: number;
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
  // Vekslende panneretning fra scene til scene, så bevegelsen ikke føles
  // identisk hele veien gjennom videoen.
  const shiftX = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, direction * 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translateX(${shiftX}px)`,
      }}
    />
  );
};

// Setter bilde-scenene etter hverandre til én video, hver med sitt Ken
// Burns-panorament og sin stemme. Første scene kan vise hooken som tekst
// nederst i bildet (svart halvtransparent stripe, lett å lese over hvilket
// som helst bilde).
export const SlideshowVideo: React.FC<SlideshowProps> = ({ scenes = [] }) => {
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
              <KenBurnsImage src={s.imageUrl} durationInFrames={dur} direction={i % 2 === 0 ? 1 : -1} />
              {s.onScreenText ? (
                <AbsoluteFill style={{ justifyContent: "flex-end" }}>
                  <div
                    style={{
                      background: "linear-gradient(0deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 100%)",
                      padding: "80px 56px 48px",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontFamily: "Arial, sans-serif",
                        fontWeight: 800,
                        fontSize: 46,
                        lineHeight: 1.25,
                        textShadow: "0 2px 10px rgba(0,0,0,.5)",
                      }}
                    >
                      {s.onScreenText}
                    </div>
                  </div>
                </AbsoluteFill>
              ) : null}
            </AbsoluteFill>
            {s.audioUrl ? <Audio src={s.audioUrl} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
