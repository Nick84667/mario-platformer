"use client";

// ─── GameCanvas ───────────────────────────────────────────────────────────────
// Renders the HTML5 canvas and all UI overlays.
// The canvas is owned by the GameEngine; React only manages the overlays.

import { useRef, useState, useCallback } from "react";
import { useGame, GameStatus } from "@/hooks/useGame";
import { useGameStore } from "@/store/gameStore";

import { HUD } from "@/components/ui/HUD";
import { StartScreen } from "@/components/ui/StartScreen";
import { PauseScreen } from "@/components/ui/PauseScreen";
import { GameOverScreen } from "@/components/ui/GameOverScreen";
import { LevelCompleteScreen } from "@/components/ui/LevelCompleteScreen";
import { TouchControls } from "@/components/ui/TouchControls";
import { LevelEditor } from "@/components/ui/LevelEditor";

import type { LevelDef } from "@/levels/types";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startGame, togglePause, restartGame, setMuted, getInput } = useGame(canvasRef);

  const status = useGameStore((s) => s.status);
  const [muted, setMutedState] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleMuteToggle = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }, [muted, setMuted]);

  // Level editor: load a custom level definition
  // (currently reloads as level 1 – extensible via engine API)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLoadLevel = useCallback((_def: LevelDef) => {
    setShowEditor(false);
    // In production you'd call engine.loadCustomLevel(def)
    // For now, just restart the game with built-in levels
    restartGame();
  }, [restartGame]);

  const isPlaying = status === GameStatus.Playing || status === GameStatus.LevelComplete;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* ── Canvas (game rendering surface) ─────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="block"
        style={{ imageRendering: "pixelated" }}
        aria-label="Mario platformer game canvas"
      />

      {/* ── HUD (score, lives, time) ────────────────────────────────────── */}
      {isPlaying && <HUD />}

      {/* ── Overlays ────────────────────────────────────────────────────── */}
      {status === GameStatus.Start && <StartScreen onStart={startGame} />}
      {status === GameStatus.Paused && (
        <PauseScreen onResume={togglePause} onRestart={restartGame} />
      )}
      {status === GameStatus.GameOver && <GameOverScreen onRestart={restartGame} />}
      {status === GameStatus.LevelComplete && <LevelCompleteScreen />}

      {/* ── Touch controls ──────────────────────────────────────────────── */}
      {isPlaying && <TouchControls getInput={getInput} />}

      {/* ── Toolbar (top-right corner) ──────────────────────────────────── */}
      <div className="absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto">
        {/* Mute */}
        <ToolbarButton onClick={handleMuteToggle} title={muted ? "Unmute" : "Mute"}>
          {muted ? "🔇" : "🔊"}
        </ToolbarButton>

        {/* Pause (only while playing) */}
        {status === GameStatus.Playing && (
          <ToolbarButton onClick={togglePause} title="Pause">
            ⏸
          </ToolbarButton>
        )}

        {/* Level editor */}
        <ToolbarButton onClick={() => setShowEditor((v) => !v)} title="Level Editor">
          🗺
        </ToolbarButton>
      </div>

      {/* ── Level editor modal ──────────────────────────────────────────── */}
      {showEditor && (
        <LevelEditor
          onLoad={handleLoadLevel}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded flex items-center justify-center text-lg cursor-pointer select-none"
      style={{
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {children}
    </button>
  );
}
