"use client";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ background: "rgba(0,0,0,0.82)" }}
    >
      {/* Title */}
      <div
        className="mb-2 text-center"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(20px, 4vw, 40px)",
          color: "#fbd000",
          textShadow: "3px 3px 0 #c84c0c, 5px 5px 0 #000",
          letterSpacing: "2px",
        }}
      >
        SUPER
      </div>
      <div
        className="mb-8 text-center"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(14px, 3vw, 28px)",
          color: "#ffffff",
          textShadow: "2px 2px 0 #e52521, 4px 4px 0 #000",
        }}
      >
        MARIO CLONE
      </div>

      {/* Character art */}
      <div className="mb-8 text-5xl select-none" aria-hidden>
        🍄
      </div>

      {/* Controls */}
      <div
        className="mb-8 text-center space-y-2"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(7px, 1.2vw, 11px)",
          color: "#cccccc",
          lineHeight: "2",
        }}
      >
        <p>← → / A D  —  MOVE</p>
        <p>SPACE / W / ↑  —  JUMP</p>
        <p>SHIFT / Z  —  RUN</p>
        <p>P / ESC  —  PAUSE</p>
      </div>

      {/* Blink prompt */}
      <button
        onClick={onStart}
        className="cursor-pointer border-0 bg-transparent animate-pulse"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.5vw, 14px)",
          color: "#ffffff",
          textShadow: "1px 1px 0 #000",
        }}
      >
        ▶  PRESS ENTER / SPACE TO START
      </button>

      <p
        className="mt-8 opacity-50"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "8px",
          color: "#ffffff",
        }}
      >
        © 2025 RAHUL96A — MIT LICENSE
      </p>
    </div>
  );
}
