// ─── Enemy entity ─────────────────────────────────────────────────────────────

import { EnemyState } from "./types";
import { stepPhysics, TileMap } from "@/engine/Physics";
import { ENEMY_SPEED, WALK_ANIM_SPEED } from "@/utils/constants";

export function updateEnemy(e: EnemyState, tileMap: TileMap, dt: number): void {
  if (!e.alive) {
    // Dead: count down then remove
    if (e.dead) {
      e.deadTimer -= dt;
    }
    return;
  }

  const scale = dt * 60;

  // ── Patrol movement ────────────────────────────────────────────────────────
  e.vx = ENEMY_SPEED * e.direction;

  stepPhysics(e, tileMap, dt, false);

  // ── Reverse on wall collision ──────────────────────────────────────────────
  // If velocity was zeroed out by a wall, flip direction
  if (Math.abs(e.vx) < 0.1 && e.onGround) {
    e.direction = e.direction === 1 ? -1 : 1;
    e.vx = ENEMY_SPEED * e.direction;
  }

  // ── Reverse at edge of platform ───────────────────────────────────────────
  if (e.onGround) {
    // Look one tile ahead – if air, reverse
    const aheadX = e.direction === 1
      ? e.x + e.width + 2
      : e.x - 2;
    const belowY = e.y + e.height + 2;
    const aheadCol = Math.floor(aheadX / 32);
    const belowRow = Math.floor(belowY / 32);
    const belowTile = tileMap.grid[belowRow * tileMap.cols + aheadCol] ?? 0;
    if (belowTile === 0) {
      e.direction = e.direction === 1 ? -1 : 1;
    }
  }

  // ── Walk animation ─────────────────────────────────────────────────────────
  e.walkAnimTimer += dt;
  if (e.walkAnimTimer >= WALK_ANIM_SPEED * 1.5) {
    e.walkAnimTimer = 0;
    e.walkAnimFrame = e.walkAnimFrame === 0 ? 1 : 0;
  }

  // Suppress unused variable warning
  void scale;
}

/** Stomp the enemy (player lands on top). */
export function stompEnemy(e: EnemyState): void {
  e.alive = false;
  e.dead = true;
  e.deadTimer = 0.5;
  e.vx = 0;
  e.vy = 0;
}

/** Kill the enemy from the side (knocks it off screen). */
export function knockbackEnemy(e: EnemyState, fromLeft: boolean): void {
  e.alive = false;
  e.dead = false; // just remove it immediately
  e.deadTimer = 0;
  e.vx = fromLeft ? 3 : -3;
  e.vy = -5;
}
