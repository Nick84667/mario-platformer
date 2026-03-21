// ─── AudioManager ─────────────────────────────────────────────────────────────
// Procedurally generates all sound effects using the Web Audio API.
// No external audio files – zero-dependency, works in any modern browser.

type SoundName =
  | "jump"
  | "coin"
  | "stomp"
  | "death"
  | "levelComplete"
  | "questionBlock"
  | "brickBreak"
  | "gameOver"
  | "oneUp";

export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ── Low-level helpers ──────────────────────────────────────────────────────

  private playTone(
    frequency: number,
    type: OscillatorType,
    duration: number,
    volume = 0.3,
    startTime?: number,
  ): void {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const t = startTime ?? ctx.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private playFreqRamp(
    from: number,
    to: number,
    type: OscillatorType,
    duration: number,
    volume = 0.3,
    startTime?: number,
  ): void {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    const t = startTime ?? ctx.currentTime;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.linearRampToValueAtTime(to, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  play(name: SoundName): void {
    if (this.muted) return;
    try {
      this[name]();
    } catch {
      // Ignore audio errors (e.g. user hasn't interacted yet)
    }
  }

  // ── Sound definitions ──────────────────────────────────────────────────────

  private jump(): void {
    this.playFreqRamp(320, 640, "square", 0.1, 0.25);
  }

  private coin(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    this.playTone(988, "square", 0.07, 0.25, t);
    this.playTone(1319, "square", 0.12, 0.2, t + 0.07);
  }

  private stomp(): void {
    this.playFreqRamp(400, 120, "square", 0.1, 0.3);
  }

  private death(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    this.playTone(440, "square", 0.06, 0.3, t);
    this.playTone(349, "square", 0.06, 0.3, t + 0.06);
    this.playTone(261, "square", 0.06, 0.3, t + 0.12);
    this.playFreqRamp(261, 100, "sawtooth", 0.4, 0.2, t + 0.18);
  }

  private levelComplete(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    // Ascending fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      this.playTone(freq, "square", 0.15, 0.25, t + i * 0.12);
    });
    this.playTone(1047, "square", 0.5, 0.3, t + notes.length * 0.12);
  }

  private questionBlock(): void {
    this.playFreqRamp(524, 784, "square", 0.08, 0.25);
  }

  private brickBreak(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    this.playFreqRamp(440, 200, "sawtooth", 0.12, 0.3, t);
    this.playFreqRamp(380, 150, "sawtooth", 0.1, 0.2, t + 0.04);
  }

  private gameOver(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    this.playTone(330, "square", 0.3, 0.3, t);
    this.playTone(294, "square", 0.3, 0.3, t + 0.3);
    this.playTone(220, "square", 0.6, 0.3, t + 0.6);
  }

  private oneUp(): void {
    const ctx = this.ensureCtx();
    const t = ctx.currentTime;
    const notes = [659, 784, 523, 659, 784];
    notes.forEach((freq, i) => {
      this.playTone(freq, "square", 0.08, 0.2, t + i * 0.08);
    });
  }

  destroy(): void {
    this.ctx?.close();
    this.ctx = null;
  }
}
