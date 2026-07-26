import { AbsoluteFill, Audio, Img, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlaypenSans";
import React from "react";

// LME sin egen font (håndskrift-stil, passer en tavle).
const { fontFamily: LME_FONT } = loadFont();

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface Drawing {
  viewBox: string;
  d: string;
  length: number;
  points: { x: number; y: number }[];
}

export interface WhiteboardProps {
  audioUrl: string;
  imageUrl: string;
  handUrl?: string;
  drawing?: Drawing | null;
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

export const WhiteboardEngine: React.FC<WhiteboardProps> = ({ audioUrl, imageUrl, handUrl, drawing, textTimestamps = [], fps = 30 }) => {
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

  const imgW = 480, imgH = 480;
  const imgLeft = (W - imgW) / 2;
  const imgTop = H - imgH - 80;

  // Tegningen bygges opp over de første ~60 % av fortellingen.
  const drawEnd = firstStart + (lastEnd - firstStart) * 0.6;
  const drawP = interpolate(t, [firstStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const hasDrawing = !!(drawing && drawing.d && drawing.length > 0);

  // Parse viewBox
  let vbW = 1024, vbH = 1024;
  if (hasDrawing) {
    const parts = String(drawing!.viewBox).split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) { vbW = parts[2]; vbH = parts[3]; }
  }

  // Tegnehåndens spiss: følger streken hvis vi har den, ellers avdekkingskanten.
  let tipX: number, tipY: number, markerVisible: boolean;
  if (hasDrawing && drawing!.points && drawing!.points.length) {
    const pts = drawing!.points;
    const pt = pts[Math.min(pts.length - 1, Math.floor(drawP * (pts.length - 1)))];
    tipX = imgLeft + (pt.x / vbW) * imgW;
    tipY = imgTop + (pt.y / vbH) * imgH;
    markerVisible = drawP < 0.995;
  } else {
    const reveal = drawP * 100;
    tipX = imgLeft + (reveal / 100) * imgW;
    tipY = imgTop + imgH * 0.5 + Math.sin(frame * 1.3) * 22;
    markerVisible = reveal < 99.5;
  }

  const dashOffset = hasDrawing ? drawing!.length * (1 - drawP) : 0;
  const fillOpacity = interpolate(drawP, [0.82, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const strokeW = Math.max(3, vbW / 200);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FBF6F0", fontFamily: LME_FONT }}>
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
      <div style={{ position: "absolute", top: 110, left: 150, right: 150, height: 320, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
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
      <div style={{ position: "absolute", top: 452, left: "50%", transform: "translateX(-50%)", width: 220, height: 8, borderRadius: 8, background: "#E91E89", opacity: 0.9 }} />

      {/* TEGNING: ekte strek-for-strek hvis vi har vektorstreker, ellers enkel avdekking */}
      {hasDrawing ? (
        <svg
          style={{ position: "absolute", top: imgTop, left: imgLeft, width: imgW, height: imgH }}
          viewBox={drawing!.viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={drawing!.d}
            fill="#1A1A1A"
            fillOpacity={fillOpacity}
            stroke="#1A1A1A"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={drawing!.length}
            strokeDashoffset={dashOffset}
          />
        </svg>
      ) : imageUrl ? (
        <div style={{ position: "absolute", top: imgTop, left: imgLeft, width: imgW, height: imgH, clipPath: `inset(0 ${100 - drawP * 100}% 0 0)` }}>
          <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      ) : null}

      {/* Tegnehånd: ekte hånd-bilde hvis vi har det, ellers tegnet markør.
          Bildet er komponert med tusjspissen nede til venstre. */}
      {markerVisible ? (
        handUrl ? (
          <img
            src={handUrl}
            style={{ position: "absolute", left: tipX - 40, top: tipY - 300, width: 340, height: 340, objectFit: "contain", pointerEvents: "none", zIndex: 999, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.16))" }}
          />
        ) : (
          <Marker x={tipX} y={tipY} />
        )
      ) : null}
    </AbsoluteFill>
  );
};
