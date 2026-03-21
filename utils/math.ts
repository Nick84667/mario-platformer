// ─── Basic maths helpers ──────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// ─── AABB overlap ─────────────────────────────────────────────────────────────

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Returns overlap depth on each axis (positive values = overlapping). */
export function overlapDepth(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): { dx: number; dy: number } {
  const dx = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
  const dy = Math.min(ay + ah, by + bh) - Math.max(ay, by);
  return { dx, dy };
}

// ─── Unique id ────────────────────────────────────────────────────────────────

let _uid = 0;
export function uid(): string {
  return `e${++_uid}`;
}
