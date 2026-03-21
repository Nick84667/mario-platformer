"use client";

import { useGameStore, selectHUD } from "@/store/gameStore";

export function HUD() {
  const { score, lives, coins, level, timeLeft, highScore } = useGameStore(selectHUD);

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-10">
      <div
        className="flex justify-between items-start px-4 py-2 text-white"
        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", textShadow: "1px 1px 0 #000, 2px 2px 0 #000" }}
      >
        {/* Score */}
        <div className="flex flex-col gap-1">
          <span className="opacity-80">MARIO</span>
          <span>{String(score).padStart(6, "0")}</span>
        </div>

        {/* Coins */}
        <div className="flex flex-col gap-1 items-center">
          <span className="opacity-80">
            <span style={{ color: "#fbd000" }}>¢</span> COINS
          </span>
          <span style={{ color: "#fbd000" }}>{String(coins).padStart(2, "0")}</span>
        </div>

        {/* World / Level */}
        <div className="flex flex-col gap-1 items-center">
          <span className="opacity-80">WORLD</span>
          <span>1-{level}</span>
        </div>

        {/* Lives */}
        <div className="flex flex-col gap-1 items-center">
          <span className="opacity-80">LIVES</span>
          <span style={{ color: "#ff6b6b" }}>{"♥ ".repeat(Math.max(0, lives)).trim()}</span>
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1 items-center">
          <span className="opacity-80">TIME</span>
          <span style={{ color: timeLeft < 100 ? "#ff6b6b" : "#ffffff" }}>
            {String(Math.ceil(timeLeft)).padStart(3, "0")}
          </span>
        </div>

        {/* High Score */}
        <div className="flex flex-col gap-1 items-end">
          <span className="opacity-80">HI-SCORE</span>
          <span style={{ color: "#fbd000" }}>{String(highScore).padStart(6, "0")}</span>
        </div>
      </div>
    </div>
  );
}
