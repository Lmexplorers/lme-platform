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

// Enkel tusj/marker som SVG. Nib-spissen sitter i lokalt punkt (14, 150),
// slik at vi kan plassere den nøyaktig der "tegningen" skjer.
const Marker: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x - 14,
      top: y - 150,
      width: 150,
      height: 160,
      pointerEvents: "none",
      zIndex: 999,
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))",
    }}
  >
    <svg width="150" height="160" viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* nib */}
      <path d="M14 150 L30 120 L44 134 Z" fill="#1A1A1A" />
      {/* pennekropp */}
      <rect x="28" y="26" width="34" height="104" rx="16" transform="rotate(38 45 78)" fill="#E91E89" />
      <rect x="30" y="96" width="30" height="26" rx="8" transform="rotate(38 45 109)" fill="#B01568" />
      {/* hånd-antydning */}
      <ellipse cx="86" cy="70" rx="40" ry="30" transform="rotate(38 86 70)" fill="#F6C7A6" />
      <ellipse cx="104" cy="58" rx="34" ry="24" transform="rotate(38 104 58)" fill="#EEB994" />
    </svg>
  </div>
);

export const WhiteboardEngine: React.FC<WhiteboardProps> = ({
  audioUrl,
  imageUrl,
  textTimestamps = [],
  fps = 30,
}) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  const W = 1920;
  const H = 1080;

  if (!textTimestamps.length) {
    return <AbsoluteFill style={{ backgroundColor: "#FBF6F0" }} />;
  }

  const startTid = textTimestamps[0].start || 0;
  const sluttTid = textTimestamps[textTimestamps.length - 1].end || startTid + 1;

  // Bildegeometri (nederst, midtstilt)
  const imgW = 520;
  const imgH = 520;
  const imgLeft = (W - imgW) / 2;
  const imgTop = H - 140 - imgH;

  // Hvor mye av bildet som er "tegnet" (avdekkes venstre -> høyre)
  const avdekking = interpolate(currentTime, [startTid, sluttTid], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Markørens posisjon = tegnekanten på bildet, med en liten skrive-vibrasjon.
  const tipX = imgLeft + (avdekking / 100) * imgW;
  const bob = Math.sin(frame * 0.7) * 10;
  const tipY = imgTop + imgH * 0.5 + bob;
  const markerSynlig = currentTime <= sluttTid + 0.2;

  // Skala teksten litt etter hvor mye det er
  const n = textTimestamps.length;
  const fontSize = n > 70 ? 34 : n > 40 ? 42 : 52;

  return (
    <AbsoluteFill style={{ backgroundColor: "#FBF6F0", fontFamily: "Verdana, Arial, sans-serif" }}>
      {audioUrl ? <Audio src={audioUrl} /> : null}

      {/* Tavle-ramme */}
      <div
        style={{
          position: "absolute",
          inset: 40,
          background: "#FFFFFF",
          border: "2px solid rgba(26,26,26,0.10)",
          borderRadius: 32,
          boxShadow: "0 20px 60px rgba(26,26,26,0.06)",
        }}
      />
      {/* Fargeprikker (marker-brett) */}
      <div style={{ position: "absolute", top: 70, right: 90, display: "flex", gap: 16 }}>
        {["#F7C72E", "#3FA9F5", "#A4D233", "#E91E89"].map((c) => (
          <div key={c} style={{ width: 26, height: 26, borderRadius: "50%", background: c }} />
        ))}
      </div>

      {/* TEKST: ordene skrives fram i takt med stemmen */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 150,
          right: 150,
          fontSize,
          lineHeight: 1.5,
          fontWeight: 700,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: "8px 14px",
        }}
      >
        {textTimestamps.map((item, index) => {
          const spoken = currentTime >= item.start;
          const isCurrent = spoken && currentTime <= item.end + 0.05;
          return (
            <span
              key={index}
              style={{
                color: isCurrent ? "#E91E89" : "#1A1A1A",
                opacity: spoken ? 1 : 0,
                transform: spoken ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.12s ease, transform 0.12s ease, color 0.1s ease",
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>

      {/* BILDE: avdekkes synkront (venstre -> høyre) */}
      {imageUrl ? (
        <div
          style={{
            position: "absolute",
            top: imgTop,
            left: imgLeft,
            width: imgW,
            height: imgH,
            clipPath: `inset(0 ${100 - avdekking}% 0 0)`,
          }}
        >
          <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      ) : null}

      {/* MARKØR som "tegner" ved avdekkingskanten */}
      {markerSynlig ? <Marker x={tipX} y={tipY} /> : null}
    </AbsoluteFill>
  );
};
