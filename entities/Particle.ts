// ─── Particle system ──────────────────────────────────────────────────────────

import { ParticleState, ScorePopup } from "./types";
import { uid, randomRange } from "@/utils/math";
import { Colors } from "@/utils/colors";
import { GRAVITY } from "@/utils/constants";

// ─── Factory functions ─────────────────────────────────────────────────────────

export function spawnBrickParticles(
  x: number,
  y: number,
  particles: ParticleState[],
): void {
  for (let i = 0; i < 8; i++) {
    particles.push({
      id: uid(),
      x: x + randomRange(4, 28),
      y: y + randomRange(4, 28),
      vx: randomRange(-4, 4),
      vy: randomRange(-8, -2),
      life: randomRange(0.4, 0.8),
      maxLife: 0.8,
      color: i % 2 === 0 ? Colors.brickFace : Colors.brickMortar,
      size: randomRange(4, 10),
      gravity: true,
    });
  }
}

export function spawnCoinParticles(
  x: number,
  y: number,
  particles: ParticleState[],
): void {
  for (let i = 0; i < 5; i++) {
    particles.push({
      id: uid(),
      x: x + randomRange(4, 16),
      y: y + randomRange(4, 16),
      vx: randomRange(-2, 2),
      vy: randomRange(-6, -2),
      life: randomRange(0.3, 0.6),
      maxLife: 0.6,
      color: i % 2 === 0 ? Colors.coinOuter : Colors.coinInner,
      size: randomRange(3, 7),
      gravity: true,
    });
  }
}

export function spawnStarParticles(
  x: number,
  y: number,
  particles: ParticleState[],
): void {
  const colors = [Colors.coinOuter, "#ffffff", Colors.playerHat];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    particles.push({
      id: uid(),
      x: x + 14,
      y: y + 14,
      vx: Math.cos(angle) * randomRange(2, 5),
      vy: Math.sin(angle) * randomRange(2, 5),
      life: 0.5,
      maxLife: 0.5,
      color: colors[i % colors.length],
      size: 5,
      gravity: false,
    });
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateParticles(particles: ParticleState[], dt: number): void {
  const scale = dt * 60;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * scale;
    p.y += p.vy * scale;
    if (p.gravity) {
      p.vy += GRAVITY * scale;
    }
  }
}

// ─── Score popups ─────────────────────────────────────────────────────────────

export function spawnScorePopup(
  x: number,
  y: number,
  value: number,
  popups: ScorePopup[],
): void {
  popups.push({
    id: uid(),
    x,
    y,
    vy: -1.2,
    value,
    life: 1,
  });
}

export function updateScorePopups(popups: ScorePopup[], dt: number): void {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.life -= dt * 0.9;
    p.y += p.vy * dt * 60;
    if (p.life <= 0) {
      popups.splice(i, 1);
    }
  }
}
