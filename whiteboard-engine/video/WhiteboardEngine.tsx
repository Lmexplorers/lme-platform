import { AbsoluteFill, Audio, Img, useCurrentFrame, interpolate } from "remotion";
import React from "react";

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface WhiteboardProps {
  audioUrl: string;
  imageUrl: string;
  textTimestamps: WordTimestamp[];
  totalFrames: number;
  fps: number;
}

interface Sentence { words: WordTimestamp[]; start: number; end: number; }

// Del manuset i korte setninger, så teksten vises setning for setning i stedet
// for som ett langt avsnitt.
function buildSentences(words: WordTimestamp[]): Sentence[] {
  const out: Sentence[] = [];
  let cur: WordTimestamp[] = [];
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const endsPunct = /[.!?:]$/.test(words[i].word);
    if (endsPunct || cur.length >= 12) {
      out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  }
  if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
  return out;
}

// Tegnemarkør (tusj + antydning av hånd). Spissen sitter i lokalt punkt (14,150).
const Marker: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 14, top: y - 150, width: 150, height: 160, pointerEvents: "none", zIndex: 999, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))" }}>
    <svg width="150" height="160" viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 150 L30 120 L44 134 Z" fill="#1A1A1A" />
      <rect x="28" y="26" width="34" height="104" rx="16" transform="rotate(38 45 78)" fill="#E91E89" />
      <rect x="30" y="96" width="30" height="26" rx="8" transform="rotate(38 45 109)" fill="#B01568" />
      <ellipse cx="86" cy="70" rx="40" ry="30" transform="rotate(38 86 70)" fill="#F6C7A6" />
      <ellipse cx="104" cy="58" rx="34" ry="24" transform="rotate(38 104 58)" fill="#EEB994" />
    </svg>
  </div>
);

export const WhiteboardEngine: React.FC<WhiteboardProps> = ({ audioUrl, imageUrl, textTimestamps = [], fps = 30 }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const W = 1920;
  const H = 1080;

  if (!textTimestamps.length) return <AbsoluteFill style={{ backgroundColor: "#FBF6F0" }} />;

  const sentences = buildSentences(textTimestamps);
  let idx = 0;
  for (let i = 0; i < sentences.length; i++) if (t >= sentences[i].start) idx = i;
  const s = sentences[idx];

  const firstStart = textTimestamps[0].start;
  const lastEnd = textTimestamps[textTimestamps.length - 1].end;

  // Bilde: tegnes ferdig raskere (over de første ~55 % av fortellingen), så det
  // ikke bare "prikkes" sakte hele veien.
  const drawEnd = firstStart + (lastEnd - firstStart) * 0.55;
  const reveal = interpolate(t, [firstStart, drawEnd], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const imgW = 460, imgH = 460;
  const imgLeft = (W - imgW) / 2;
  const imgTop = H - imgH - 90;

  // Markøren tegner ved avdekkingskanten på bildet, med tydelig bevegelse.
  const tipX = imgLeft + (reveal / 100) * imgW;
  const tipY = imgTop + imgH * 0.5 + Math.sin(frame * 1.3) * 22;
  const markerVisible = reveal < 99.5;

  return (
    <AbsoluteFill style={{ backgroundColor: "#FBF6F0", fontFamily: "Verdana, Arial, sans-serif" }}>
      {audioUrl ? <Audio src={audioUrl} /> : null}

      {/* Tavle-ramme */}
      <div style={{ position: "absolute", inset: 36, background: "#FFFFFF", border: "2px solid rgba(26,26,26,0.10)", borderRadius: 30, boxShadow: "0 20px 60px rgba(26,26,26,0.06)" }} />
      {/* Marker-brett */}
      <div style={{ position: "absolute", top: 64, right: 84, display: "flex", gap: 16 }}>
        {["#F7C72E", "#3FA9F5", "#A4D233", "#E91E89"].map((c) => (
          <div key={c} style={{ width: 26, height: 26, borderRadius: "50%", background: c }} />
        ))}
      </div>

      {/* TEKST: én setning om gangen, stor og midtstilt, ord for ord */}
      <div style={{ position: "absolute", top: 110, left: 150, right: 150, height: 340, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.32, color: "#1A1A1A" }}>
          {s.words.map((w, i) => {
            const vis = t >= w.start;
            const isCur = vis && t <= w.end + 0.06;
            return (
              <span key={i} style={{ opacity: vis ? 1 : 0, color: isCur ? "#E91E89" : "#1A1A1A", transition: "opacity 0.09s ease, color 0.09s ease" }}>
                {w.word}{" "}
              </span>
            );
          })}
        </div>
      </div>
      {/* cerise understrek under teksten */}
      <div style={{ position: "absolute", top: 466, left: "50%", transform: "translateX(-50%)", width: 220, height: 8, borderRadius: 8, background: "#E91E89", opacity: 0.9 }} />

      {/* BILDE: tegnes fram (venstre -> høyre) */}
      {imageUrl ? (
        <div style={{ position: "absolute", top: imgTop, left: imgLeft, width: imgW, height: imgH, clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      ) : null}

      {markerVisible ? <Marker x={tipX} y={tipY} /> : null}
    </AbsoluteFill>
  );
};
