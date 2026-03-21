"use client";

// Mobile on-screen D-pad and jump button.
// Injects virtual button state directly into the InputManager.

import { useCallback, useEffect, useRef } from "react";
import type { InputManager } from "@/engine/InputManager";

interface TouchControlsProps {
  getInput: () => InputManager | null;
}

interface DpadButton {
  label: string;
  action: "left" | "right" | "jump" | "run";
  className: string;
  style?: React.CSSProperties;
}

const BUTTONS: DpadButton[] = [
  { label: "◀", action: "left", className: "left-0" },
  { label: "▶", action: "right", className: "left-[56px]" },
];

const ACTION_BUTTONS: DpadButton[] = [
  { label: "B", action: "run", className: "right-[72px]", style: { background: "rgba(229,37,33,0.85)" } },
  { label: "A", action: "jump", className: "right-0", style: { background: "rgba(4,156,216,0.85)" } },
];

function VButton({
  btn,
  getInput,
}: {
  btn: DpadButton;
  getInput: () => InputManager | null;
}) {
  const pressedRef = useRef(false);

  const press = useCallback(() => {
    if (pressedRef.current) return;
    pressedRef.current = true;
    getInput()?.setTouch(btn.action, true);
  }, [btn.action, getInput]);

  const release = useCallback(() => {
    pressedRef.current = false;
    getInput()?.setTouch(btn.action, false);
  }, [btn.action, getInput]);

  return (
    <button
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={`absolute bottom-0 w-12 h-12 rounded-full select-none touch-none flex items-center justify-center text-white font-bold text-lg ${btn.className}`}
      style={{
        background: btn.style?.background ?? "rgba(255,255,255,0.25)",
        border: "2px solid rgba(255,255,255,0.45)",
        ...btn.style,
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: "pointer",
      }}
      aria-label={btn.action}
    >
      {btn.label}
    </button>
  );
}

export function TouchControls({ getInput }: TouchControlsProps) {
  // Only show on coarse-pointer (touch) devices
  const showRef = useRef(false);

  useEffect(() => {
    showRef.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  // Always render – CSS hides on non-touch
  return (
    <>
      {/* Left D-pad */}
      <div
        className="absolute bottom-6 left-4 h-12 pointer-events-auto z-30 md:opacity-100"
        style={{ width: "116px" }}
      >
        {BUTTONS.map((btn) => (
          <VButton key={btn.action} btn={btn} getInput={getInput} />
        ))}
      </div>

      {/* Action buttons */}
      <div
        className="absolute bottom-6 right-4 h-12 pointer-events-auto z-30"
        style={{ width: "132px" }}
      >
        {ACTION_BUTTONS.map((btn) => (
          <VButton key={btn.action} btn={btn} getInput={getInput} />
        ))}
      </div>
    </>
  );
}
