// ─── LevelLoader ──────────────────────────────────────────────────────────────
// Converts a compact LevelDef JSON into runtime structures:
//   • A flat Uint8Array tile grid
//   • Initial positions for player, enemies, and coins

import { TileType } from "@/entities/types";
import { TileMap } from "@/engine/Physics";
import { LevelDef } from "./types";
import { TILE_SIZE, PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from "@/utils/constants";
import { uid } from "@/utils/math";
import type { PlayerState, EnemyState, CoinState } from "@/entities/types";

export interface LoadedLevel {
  tileMap: TileMap;
  player: PlayerState;
  enemies: EnemyState[];
  coins: CoinState[];
  levelPixelWidth: number;
  levelPixelHeight: number;
  /** Tile-grid cols */
  cols: number;
  /** Tile-grid rows */
  rows: number;
  /** Goal flag world position */
  goalX: number;
  goalY: number;
  goalWidth: number;
  goalHeight: number;
}

// Which tile types have question-block coin inside (managed separately)
export const questionBlockCoins = new Map<string, boolean>();

export function loadLevel(def: LevelDef, onTileBump: (col: number, row: number) => void): LoadedLevel {
  const { width: cols, height: rows } = def;
  const grid = new Uint8Array(cols * rows); // initialised to 0 = Air

  function set(col: number, row: number, type: TileType): void {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    grid[row * cols + col] = type;
  }

  // ── Fill regions ────────────────────────────────────────────────────────────
  for (const region of def.regions) {
    for (let r = region.row; r < region.row + region.h; r++) {
      for (let c = region.col; c < region.col + region.w; c++) {
        set(c, r, region.type as TileType);
      }
    }
  }

  // ── Place individual blocks ──────────────────────────────────────────────────
  for (const block of def.blocks) {
    const type =
      block.type === "brick" ? TileType.Brick :
      block.type === "question" ? TileType.QuestionBlock :
      TileType.QuestionBlockHit;
    set(block.col, block.row, type);

    if (block.type === "question" && block.coin) {
      questionBlockCoins.set(`${block.col},${block.row}`, true);
    }
  }

  // ── Place pipes ──────────────────────────────────────────────────────────────
  for (const pipe of def.pipes) {
    // Pipe is 2 tiles wide
    for (let h = 0; h < pipe.height; h++) {
      const row = pipe.row - h;
      const type = h === 0 ? TileType.PipeTop : TileType.PipeBody;
      set(pipe.col, row, type);
      set(pipe.col + 1, row, type);
    }
  }

  // ── Goal flag ────────────────────────────────────────────────────────────────
  const goalCol = def.goal.col;
  const goalRow = def.goal.row;
  // Tall flag pole spanning several rows
  for (let r = goalRow - 4; r <= goalRow; r++) {
    set(goalCol, r, TileType.Goal);
  }

  const tileMap: TileMap = { grid, cols, rows, onTileBump };

  // ── Player ───────────────────────────────────────────────────────────────────
  const playerX = def.playerStart.col * TILE_SIZE + (TILE_SIZE - PLAYER_WIDTH) / 2;
  const playerY = (def.playerStart.row - 1) * TILE_SIZE - PLAYER_HEIGHT;

  const player: PlayerState = {
    x: playerX,
    y: playerY,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: false,
    facingRight: true,
    running: false,
    jumpHeld: false,
    jumpHeldFrames: 0,
    dead: false,
    deadTimer: 0,
    invincible: false,
    invincibleTimer: 0,
    walkAnimTimer: 0,
    walkAnimFrame: 0,
  };

  // ── Enemies ───────────────────────────────────────────────────────────────────
  const enemies: EnemyState[] = def.enemies.map((e): EnemyState => ({
    id: uid(),
    type: e.type,
    x: e.col * TILE_SIZE + (TILE_SIZE - ENEMY_WIDTH) / 2,
    y: (e.row - 1) * TILE_SIZE - ENEMY_HEIGHT,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    vx: -TILE_SIZE * 0.038, // gentle leftward initial speed
    vy: 0,
    onGround: false,
    alive: true,
    dead: false,
    deadTimer: 0,
    direction: -1,
    walkAnimTimer: 0,
    walkAnimFrame: 0,
  }));

  // ── Coins ─────────────────────────────────────────────────────────────────────
  const COIN_SIZE = 20;
  const coins: CoinState[] = def.coins.map((c): CoinState => ({
    id: uid(),
    x: c.col * TILE_SIZE + (TILE_SIZE - COIN_SIZE) / 2,
    y: (c.row - 1) * TILE_SIZE - COIN_SIZE / 2,
    width: COIN_SIZE,
    height: COIN_SIZE,
    collected: false,
    bobTimer: Math.random() * Math.PI * 2, // random phase
  }));

  return {
    tileMap,
    player,
    enemies,
    coins,
    levelPixelWidth: cols * TILE_SIZE,
    levelPixelHeight: rows * TILE_SIZE,
    cols,
    rows,
    goalX: goalCol * TILE_SIZE,
    goalY: (goalRow - 4) * TILE_SIZE,
    goalWidth: TILE_SIZE,
    goalHeight: 5 * TILE_SIZE,
  };
}
