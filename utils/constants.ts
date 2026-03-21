// ─── Tile / World ────────────────────────────────────────────────────────────
export const TILE_SIZE = 32;

// Virtual (internal) resolution – everything is rendered at this size then
// scaled to fill the browser window while keeping the correct aspect ratio.
export const VIRTUAL_WIDTH = 800;
export const VIRTUAL_HEIGHT = 450;

// ─── Physics (values normalised to 60 fps; multiply by dt*60 each frame) ─────
export const GRAVITY = 0.55;
export const MAX_FALL_SPEED = 16;
export const JUMP_FORCE = -12;
// How long the jump key can be held to extend the jump height
export const JUMP_HOLD_FRAMES = 12;
export const JUMP_HOLD_FORCE = -0.4;
export const WALK_SPEED = 3.5;
export const RUN_SPEED = 6;
export const FRICTION_GROUND = 0.78;
export const FRICTION_AIR = 0.92;

// ─── Player ──────────────────────────────────────────────────────────────────
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 30;
export const PLAYER_INVINCIBLE_DURATION = 2; // seconds

// ─── Enemy ───────────────────────────────────────────────────────────────────
export const ENEMY_WIDTH = 28;
export const ENEMY_HEIGHT = 28;
export const ENEMY_SPEED = 1.2;
export const ENEMY_DEAD_DURATION = 0.5; // seconds before removal

// ─── Game rules ──────────────────────────────────────────────────────────────
export const LIVES_START = 3;
export const COIN_SCORE = 100;
export const ENEMY_KILL_SCORE = 200;
export const COIN_QUESTION_BONUS = 200;
export const TIME_BONUS_PER_SECOND = 50;

// ─── Camera ──────────────────────────────────────────────────────────────────
export const CAMERA_LERP = 0.12;
// Keep player a bit to the left of centre
export const CAMERA_LEAD_X = VIRTUAL_WIDTH * 0.35;
export const CAMERA_LEAD_Y = VIRTUAL_HEIGHT * 0.45;

// ─── Animation ───────────────────────────────────────────────────────────────
export const WALK_ANIM_SPEED = 0.13; // seconds per frame
export const COIN_BOB_SPEED = 2;     // radians/second

// ─── Scoring bonus thresholds ─────────────────────────────────────────────────
export const STOMP_COMBO_WINDOW = 0.6; // seconds to chain stomps for bonus
