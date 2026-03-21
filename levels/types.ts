// ─── Level definition types ───────────────────────────────────────────────────
// Levels are stored as compact JSON objects and converted to a flat tile grid
// by LevelLoader at runtime.

export interface TileRegion {
  /** Top-left column (tile coords) */
  col: number;
  /** Top-left row (tile coords) */
  row: number;
  /** Width in tiles */
  w: number;
  /** Height in tiles */
  h: number;
  /** Tile type (matches TileType enum values) */
  type: number;
}

export interface BlockDef {
  col: number;
  row: number;
  /** "brick" | "question" | "questionHit" */
  type: "brick" | "question" | "questionHit";
  /** If true, bumping the question block spawns a coin */
  coin?: boolean;
}

export interface PipeDef {
  /** Left column of the pipe (pipe is 2 tiles wide) */
  col: number;
  /** Row where the pipe top sits */
  row: number;
  /** Height in tiles (top cap + body) */
  height: number;
}

export interface EnemyDef {
  type: "goomba";
  /** Tile column of the enemy start position */
  col: number;
  /** Row the enemy stands on (feet tile) */
  row: number;
}

export interface CoinDef {
  col: number;
  row: number;
}

export interface LevelDef {
  id: number;
  name: string;
  /** Total tile columns */
  width: number;
  /** Total tile rows */
  height: number;
  /** Background colour theme */
  background: "day" | "night" | "underground";
  /** Time limit (seconds) */
  timeLimit: number;
  /** Tile coord where the player spawns (feet touch top of this tile) */
  playerStart: { col: number; row: number };
  /** Tile coord of the goal flag (touches top of this tile) */
  goal: { col: number; row: number };
  /** Rectangular tile regions (ground, platforms, etc.) */
  regions: TileRegion[];
  /** Individual special blocks */
  blocks: BlockDef[];
  /** Pipes */
  pipes: PipeDef[];
  /** Enemy spawn points */
  enemies: EnemyDef[];
  /** Free-floating coin positions */
  coins: CoinDef[];
}
