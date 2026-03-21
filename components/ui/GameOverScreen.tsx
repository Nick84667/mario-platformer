"use client";

import { useGameStore } from "@/store/gameStore";

interface GameOverScreenProps {
  onRestart: () => void;
}

export function GameOverScreen({ onRestart }: GameOverScreenProps) {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ background: "rgba(0,0,0,0.88)" }}
    >
      <div
        className="mb-4"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(20px, 4vw, 38px)",
          color: "#e52521",
          textShadow: "3px 3px 0 #000",
        }}
      >
        GAME OVER
      </div>

      <div
        className="mb-8 text-center space-y-2"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.4vw, 13px)",
          color: "#ffffff",
          lineHeight: 2,
        }}
      >
        <p>
          SCORE: <span style={{ color: "#fbd000" }}>{String(score).padStart(6, "0")}</span>
        </p>
        <p>
          BEST: <span style={{ color: "#fbd000" }}>{String(highScore).padStart(6, "0")}</span>
        </p>
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-4 cursor-pointer animate-pulse"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.3vw, 13px)",
          color: "#ffffff",
          background: "rgba(229,37,33,0.7)",
          border: "2px solid #e52521",
          borderRadius: "4px",
          textShadow: "1px 1px 0 #000",
        }}
      >
        ▶  PLAY AGAIN
      </button>
    </div>
  );
}
