"use client";

// ─── useGame ──────────────────────────────────────────────────────────────────
// Manages the full lifecycle of the GameEngine for the GameCanvas component.
// The engine lives outside React's render cycle and updates Zustand directly.

import { useEffect, useRef, useCallback } from "react";
import { GameEngine } from "@/engine/GameEngine";
import { InputManager } from "@/engine/InputManager";
import { AudioManager } from "@/engine/AudioManager";
import { useGameStore } from "@/store/gameStore";
import { GameStatus } from "@/entities/types";

import level1 from "@/levels/level1.json";
import level2 from "@/levels/level2.json";
import type { LevelDef } from "@/levels/types";

const LEVEL_DEFS: LevelDef[] = [level1 as LevelDef, level2 as LevelDef];

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<GameEngine | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const audioRef = useRef<AudioManager | null>(null);

  // ── Bootstrap the engine once ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || engineRef.current) return;

    const input = new InputManager();
    const audio = new AudioManager();
    const engine = new GameEngine(canvas, input, audio);

    engine.loadLevels(LEVEL_DEFS);

    // Bridge: engine writes a plain snapshot; Zustand merges it
    engine.setStoreUpdater((snapshot) => {
      useGameStore.setState(snapshot);
    });

    engine.resize(window.innerWidth, window.innerHeight);
    engine.start();
    input.attach();

    inputRef.current = input;
    audioRef.current = audio;
    engineRef.current = engine;

    return () => {
      engine.stop();
      input.detach();
      audio.destroy();
      engineRef.current = null;
      inputRef.current = null;
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Window resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      engineRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Stable action callbacks ────────────────────────────────────────────────
  const startGame   = useCallback(() => engineRef.current?.startGame(),    []);
  const togglePause = useCallback(() => engineRef.current?.togglePause(),  []);
  const restartGame = useCallback(() => engineRef.current?.restartGame(),  []);
  const setMuted    = useCallback((m: boolean) => audioRef.current?.setMuted(m), []);
  const getInput    = useCallback(() => inputRef.current, []);

  return { startGame, togglePause, restartGame, setMuted, getInput };
}

export { GameStatus };
