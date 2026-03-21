"use client";

// ─── Basic Level Editor ────────────────────────────────────────────────────────
// Provides a JSON textarea where developers can paste a custom LevelDef
// and hot-load it into the game.

import { useState } from "react";
import type { LevelDef } from "@/levels/types";

interface LevelEditorProps {
  onLoad: (def: LevelDef) => void;
  onClose: () => void;
}

const PLACEHOLDER = JSON.stringify(
  {
    id: 99,
    name: "Custom Level",
    width: 50,
    height: 14,
    background: "day",
    timeLimit: 300,
    playerStart: { col: 3, row: 12 },
    goal: { col: 45, row: 12 },
    regions: [{ col: 0, row: 12, w: 50, h: 2, type: 1 }],
    blocks: [],
    pipes: [],
    enemies: [{ type: "goomba", col: 15, row: 12 }],
    coins: [{ col: 8, row: 10 }],
  } satisfies LevelDef,
  null,
  2,
);

export function LevelEditor({ onLoad, onClose }: LevelEditorProps) {
  const [json, setJson] = useState(PLACEHOLDER);
  const [error, setError] = useState<string | null>(null);

  function handleLoad() {
    try {
      const def = JSON.parse(json) as LevelDef;
      // Basic validation
      if (!def.width || !def.height || !def.playerStart || !def.goal) {
        throw new Error("Missing required fields: width, height, playerStart, goal");
      }
      setError(null);
      onLoad(def);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.88)" }}
    >
      <div
        className="flex flex-col gap-4 w-full max-w-2xl mx-4 rounded-lg overflow-hidden"
        style={{ border: "2px solid rgba(255,255,255,0.2)" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-4 py-3"
          style={{ background: "rgba(229,37,33,0.8)" }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "12px",
              color: "#ffffff",
            }}
          >
            LEVEL EDITOR
          </span>
          <button
            onClick={onClose}
            className="text-white text-xl font-bold cursor-pointer bg-transparent border-0"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <p
          className="px-4 text-gray-300 text-xs leading-relaxed"
          style={{ fontFamily: "monospace" }}
        >
          Edit the JSON below and click &quot;Load Level&quot; to play your custom level.
          See the project README for the full LevelDef schema.
        </p>

        {/* JSON textarea */}
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="mx-4 rounded p-3 text-xs font-mono resize-none focus:outline-none"
          style={{
            background: "#1a1a2e",
            color: "#e0e0e0",
            border: "1px solid rgba(255,255,255,0.2)",
            height: "300px",
          }}
          spellCheck={false}
        />

        {/* Error */}
        {error && (
          <p className="mx-4 text-red-400 text-xs font-mono">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-4">
          <button
            onClick={handleLoad}
            className="flex-1 py-2 rounded cursor-pointer text-white font-bold"
            style={{
              background: "rgba(67,176,71,0.8)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "10px",
              border: "2px solid #43b047",
            }}
          >
            ▶ LOAD LEVEL
          </button>
          <button
            onClick={() => setJson(PLACEHOLDER)}
            className="flex-1 py-2 rounded cursor-pointer text-white"
            style={{
              background: "rgba(255,255,255,0.1)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "10px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
