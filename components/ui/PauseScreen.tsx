"use client";

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseScreen({ onResume, onRestart }: PauseScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className="mb-8"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(18px, 3vw, 32px)",
          color: "#fbd000",
          textShadow: "2px 2px 0 #000",
        }}
      >
        PAUSED
      </div>

      <div className="flex flex-col gap-4 items-center">
        <MenuButton onClick={onResume}>▶  RESUME</MenuButton>
        <MenuButton onClick={onRestart}>↺  RESTART</MenuButton>
      </div>

      <p
        className="mt-8 opacity-60"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "9px",
          color: "#ffffff",
        }}
      >
        P / ESC — RESUME
      </p>
    </div>
  );
}

function MenuButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded cursor-pointer transition-colors"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "clamp(9px, 1.3vw, 13px)",
        color: "#ffffff",
        background: "rgba(255,255,255,0.1)",
        border: "2px solid rgba(255,255,255,0.3)",
        textShadow: "1px 1px 0 #000",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.background = "rgba(229,37,33,0.6)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
      }}
    >
      {children}
    </button>
  );
}
