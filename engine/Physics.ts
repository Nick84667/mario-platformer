// ─── Physics ──────────────────────────────────────────────────────────────────
// Resolves movement and tile collisions for any entity that has the right shape.
// Completely decoupled from rendering and entity logic.

import { TileType, isSolidTile } from "@/entities/types";
import {
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  FRICTION_GROUND,
  FRICTION_AIR,
} from "@/utils/constants";
import { clamp } from "@/utils/math";

export interface PhysicsBody {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
}

export type TileGrid = Uint8Array; // flat row-major array [row * cols + col]

export interface TileMap {
  grid: TileGrid;
  cols: number;
  rows: number;
  // Callback when a tile is bumped from below (question blocks, bricks)
  onTileBump?: (col: number, row: number) => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getTile(map: TileMap, col: number, row: number): TileType {
  if (col < 0 || col >= map.cols || row < 0 || row >= map.rows) {
    // Treat out-of-bounds as solid on the sides, open at top, solid at bottom
    if (row >= map.rows) return TileType.Ground;
    return TileType.Air;
  }
  return map.grid[row * map.cols + col] as TileType;
}

/** Get all tiles overlapping the given world AABB. */
function getTilesInRect(
  map: TileMap,
  x: number,
  y: number,
  w: number,
  h: number,
): Array<{ col: number; row: number; type: TileType; wx: number; wy: number }> {
  const minCol = Math.floor(x / TILE_SIZE);
  const maxCol = Math.floor((x + w - 1) / TILE_SIZE);
  const minRow = Math.floor(y / TILE_SIZE);
  const maxRow = Math.floor((y + h - 1) / TILE_SIZE);

  const result: Array<{ col: number; row: number; type: TileType; wx: number; wy: number }> = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const type = getTile(map, c, r);
      if (isSolidTile(type)) {
        result.push({ col: c, row: r, type, wx: c * TILE_SIZE, wy: r * TILE_SIZE });
      }
    }
  }
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Step physics for one frame.
 *   1. Apply gravity.
 *   2. Move on X, resolve X collisions.
 *   3. Move on Y, resolve Y collisions.
 *
 * @param body      Entity to update (mutated in place)
 * @param map       Current tile map
 * @param dt        Delta time in seconds
 * @param isPlayer  If true, fire onTileBump for overhead collisions
 */
export function stepPhysics(
  body: PhysicsBody,
  map: TileMap,
  dt: number,
  isPlayer = false,
): void {
  const scale = dt * 60; // normalise to 60-fps values

  // ── Apply gravity ──────────────────────────────────────────────────────────
  body.vy = clamp(body.vy + GRAVITY * scale, -99, MAX_FALL_SPEED);

  // ── Apply friction ─────────────────────────────────────────────────────────
  const friction = body.onGround ? FRICTION_GROUND : FRICTION_AIR;
  body.vx *= Math.pow(friction, scale);

  body.onGround = false;

  // ── Horizontal movement + collision ───────────────────────────────────────
  body.x += body.vx * scale;
  for (const tile of getTilesInRect(map, body.x, body.y, body.width, body.height)) {
    const overlapLeft = body.x + body.width - tile.wx;
    const overlapRight = tile.wx + TILE_SIZE - body.x;
    if (overlapLeft < overlapRight) {
      body.x = tile.wx - body.width;
      body.vx = 0;
    } else {
      body.x = tile.wx + TILE_SIZE;
      body.vx = 0;
    }
  }

  // ── Vertical movement + collision ─────────────────────────────────────────
  body.y += body.vy * scale;
  for (const tile of getTilesInRect(map, body.x, body.y, body.width, body.height)) {
    const overlapTop = body.y + body.height - tile.wy;
    const overlapBottom = tile.wy + TILE_SIZE - body.y;
    if (overlapTop < overlapBottom) {
      // Landed on top of tile
      body.y = tile.wy - body.height;
      body.vy = 0;
      body.onGround = true;
    } else {
      // Hit ceiling
      body.y = tile.wy + TILE_SIZE;
      if (body.vy < 0) {
        body.vy = 0;
        if (isPlayer && map.onTileBump) {
          map.onTileBump(tile.col, tile.row);
        }
      }
    }
  }
}

/** Apply horizontal friction only (used for dead player tumble). */
export function applyFriction(body: PhysicsBody, dt: number): void {
  const scale = dt * 60;
  body.vx *= Math.pow(FRICTION_GROUND, scale);
  body.vy = clamp(body.vy + GRAVITY * scale, -99, MAX_FALL_SPEED);
  body.x += body.vx * scale;
  body.y += body.vy * scale;
}
