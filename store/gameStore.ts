"use client";

import { create } from "zustand";
import { GameStatus } from "@/entities/types";

interface GameStore {
  // ── UI-visible state (read by React overlays) ──────────────────────────────
  status: GameStatus;
  score: number;
  lives: number;
  coins: number;
  level: number;
  timeLeft: number;
  highScore: number;

  // ── Actions ────────────────────────────────────────────────────────────────
  updateHighScore: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  status: GameStatus.Start,
  score: 0,
  lives: 3,
  coins: 0,
  level: 1,
  timeLeft: 400,
  highScore: 0,
};

export const useGameStore = create<GameStore>()((set) => ({
  ...INITIAL_STATE,

  updateHighScore: () =>
    set((s) => ({ highScore: Math.max(s.highScore, s.score) })),

  reset: () => set(INITIAL_STATE),
}));

// Selector – reads only what the HUD needs, preventing spurious re-renders
export const selectHUD = (s: GameStore) => ({
  score: s.score,
  lives: s.lives,
  coins: s.coins,
  level: s.level,
  timeLeft: s.timeLeft,
  highScore: s.highScore,
});
