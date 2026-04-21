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
  /** Final merged state for the current frame */
  private current: InputState = BLANK_STATE();

  /** Final merged state for the previous frame */
  private previous: InputState = BLANK_STATE();

  /** Raw keyboard state updated directly by DOM events */
  private keyboardState: InputState = BLANK_STATE();

  /** Raw touch state injected externally */
  private touchState: InputState = BLANK_STATE();

  private onKeyDown = (e: KeyboardEvent): void => {
    const key = KEY_MAP[e.code];
    if (key) {
      e.preventDefault();
      this.keyboardState[key] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const key = KEY_MAP[e.code];
    if (key) {
      e.preventDefault();
      this.keyboardState[key] = false;
    }
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
    this.keyboardState = BLANK_STATE();
    this.touchState = BLANK_STATE();
  }

  /**
   * Called once per frame at the start of update.
   * 1) Save previous frame
   * 2) Rebuild current frame from keyboard + touch
   */
  update(): void {
    this.previous = { ...this.current };

    this.current = {
      left: this.keyboardState.left || this.touchState.left,
      right: this.keyboardState.right || this.touchState.right,
      jump: this.keyboardState.jump || this.touchState.jump,
      run: this.keyboardState.run || this.touchState.run,
      pause: this.keyboardState.pause || this.touchState.pause,
      start: this.keyboardState.start || this.touchState.start,
    };
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
  }

  /** Clear all input – useful when entering/leaving pause. */
  flush(): void {
    this.current = BLANK_STATE();
    this.previous = BLANK_STATE();
    this.keyboardState = BLANK_STATE();
    this.touchState = BLANK_STATE();
  }
}
``