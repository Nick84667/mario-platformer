"use client";

import { useGameStore } from "@/store/gameStore";

export function LevelCompleteScreen() {
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
      style={{ background: "rgba(0,0,0,0.65)" }}
    >
      <div
        className="mb-4 animate-bounce"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(16px, 3vw, 30px)",
          color: "#fbd000",
          textShadow: "2px 2px 0 #000",
        }}
      >
        LEVEL CLEAR!
      </div>

      <div
        className="mb-4"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.4vw, 13px)",
          color: "#ffffff",
          textShadow: "1px 1px 0 #000",
        }}
      >
        WORLD 1-{level} COMPLETE
      </div>

      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.4vw, 13px)",
          color: "#fbd000",
        }}
      >
        SCORE: {String(score).padStart(6, "0")}
      </div>

      <p
        className="mt-8 opacity-70"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "9px",
          color: "#ffffff",
        }}
      >
        NEXT LEVEL LOADING...
      </p>
    </div>
  );
}
