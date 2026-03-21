// ─── Shared geometry ──────────────────────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Tile types ───────────────────────────────────────────────────────────────

export enum TileType {
  Air = 0,
  Ground = 1,
  Brick = 2,
  QuestionBlock = 3,
  QuestionBlockHit = 4,
  PipeTop = 5,
  PipeBody = 6,
  Goal = 7,
}

export function isSolidTile(type: TileType): boolean {
  return (
    type === TileType.Ground ||
    type === TileType.Brick ||
    type === TileType.QuestionBlock ||
    type === TileType.QuestionBlockHit ||
    type === TileType.PipeTop ||
    type === TileType.PipeBody ||
    type === TileType.Goal
  );
}

// ─── Player ───────────────────────────────────────────────────────────────────

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facingRight: boolean;
  running: boolean;
  jumpHeld: boolean;
  jumpHeldFrames: number;
  dead: boolean;
  deadTimer: number;
  invincible: boolean;
  invincibleTimer: number;
  walkAnimTimer: number;
  walkAnimFrame: number;
}

// ─── Enemy ────────────────────────────────────────────────────────────────────

export type EnemyType = "goomba";

export interface EnemyState {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
  alive: boolean;
  dead: boolean;
  deadTimer: number;
  direction: 1 | -1;
  walkAnimTimer: number;
  walkAnimFrame: number;
}

// ─── Coin ─────────────────────────────────────────────────────────────────────

export interface CoinState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  // floating bob animation
  bobTimer: number;
}

// ─── Floating score popup ─────────────────────────────────────────────────────

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  vy: number;
  value: number;
  life: number; // 0–1
}

// ─── Particle ─────────────────────────────────────────────────────────────────

export interface ParticleState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;   // seconds remaining
  maxLife: number;
  color: string;
  size: number;
  gravity: boolean;
}

// ─── Game status ──────────────────────────────────────────────────────────────

export enum GameStatus {
  Start = "start",
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameover",
  LevelComplete = "levelcomplete",
}

// ─── Camera ───────────────────────────────────────────────────────────────────

export interface CameraState {
  x: number;
  y: number;
}
