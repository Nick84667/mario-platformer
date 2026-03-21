// ─── InputManager ─────────────────────────────────────────────────────────────
// Captures keyboard events and exposes a clean isDown / isPressed interface.
// Touch state can be injected externally (from TouchControls component).

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
  pause: boolean;
  start: boolean;
}

type InputKey = keyof InputState;

const BLANK_STATE = (): InputState => ({
  left: false,
  right: false,
  jump: false,
  run: false,
  pause: false,
  start: false,
});

// Key code → logical action
const KEY_MAP: Record<string, InputKey> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "jump",
  KeyW: "jump",
  ShiftLeft: "run",
  ShiftRight: "run",
  KeyZ: "run",
  KeyX: "run",
  Escape: "pause",
  KeyP: "pause",
  Enter: "start",
  NumpadEnter: "start",
};

export class InputManager {
  private current: InputState = BLANK_STATE();
  private previous: InputState = BLANK_STATE();

  // Touch overrides – set externally by TouchControls component
  private touchState: Partial<InputState> = {};

  private onKeyDown = (e: KeyboardEvent): void => {
    const key = KEY_MAP[e.code];
    if (key) {
      e.preventDefault();
      this.current[key] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const key = KEY_MAP[e.code];
    if (key) this.current[key] = false;
  };

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.current = BLANK_STATE();
    this.previous = BLANK_STATE();
    this.touchState = {};
  }

  /** Called once per frame at the start of update – snapshots previous state. */
  update(): void {
    this.previous = { ...this.current };

    // Merge touch overrides
    for (const k in this.touchState) {
      const key = k as InputKey;
      if (this.touchState[key]) this.current[key] = true;
    }
  }

  /** True every frame while the key is held. */
  isDown(key: InputKey): boolean {
    return this.current[key];
  }

  /** True only on the frame the key was first pressed. */
  isPressed(key: InputKey): boolean {
    return this.current[key] && !this.previous[key];
  }

  /** True only on the frame the key was released. */
  isReleased(key: InputKey): boolean {
    return !this.current[key] && this.previous[key];
  }

  /** Called by TouchControls to inject virtual button state. */
  setTouch(key: InputKey, value: boolean): void {
    this.touchState[key] = value;
    if (value) this.current[key] = true;
    else {
      // Only clear if not also held on keyboard
      this.touchState[key] = false;
    }
  }

  /** Clear all input – useful when entering/leaving pause. */
  flush(): void {
    this.current = BLANK_STATE();
    this.previous = BLANK_STATE();
    this.touchState = {};
  }
}
