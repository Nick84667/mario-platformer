// ─── Player entity ────────────────────────────────────────────────────────────

import { PlayerState } from "./types";
import { InputManager } from "@/engine/InputManager";
import { stepPhysics, applyFriction, TileMap } from "@/engine/Physics";
import {
  JUMP_FORCE,
  JUMP_HOLD_FRAMES,
  JUMP_HOLD_FORCE,
  WALK_SPEED,
  RUN_SPEED,
  PLAYER_INVINCIBLE_DURATION,
  WALK_ANIM_SPEED,
} from "@/utils/constants";

export function updatePlayer(
  p: PlayerState,
  input: InputManager,
  tileMap: TileMap,
  dt: number,
  levelPixelWidth: number,
): void {
  if (p.dead) {
    // Dead bounce physics
    p.deadTimer -= dt;
    applyFriction(p, dt);
    return;
  }

  const scale = dt * 60;

  // ── Horizontal input ────────────────────────────────────────────────────────
  p.running = input.isDown("run");
  const speed = p.running ? RUN_SPEED : WALK_SPEED;

  if (input.isDown("left")) {
    p.vx -= speed * 0.25 * scale;
    p.vx = Math.max(p.vx, -speed);
    p.facingRight = false;
  } else if (input.isDown("right")) {
    p.vx += speed * 0.25 * scale;
    p.vx = Math.min(p.vx, speed);
    p.facingRight = true;
  }

  // ── Jump ───────────────────────────────────────────────────────────────────
  if (input.isPressed("jump") && p.onGround) {
    p.vy = JUMP_FORCE;
    p.jumpHeld = true;
    p.jumpHeldFrames = 0;
  }

  // Variable jump height – hold to float longer
  if (p.jumpHeld) {
    if (input.isDown("jump") && p.jumpHeldFrames < JUMP_HOLD_FRAMES) {
      p.vy += JUMP_HOLD_FORCE * scale;
      p.jumpHeldFrames++;
    } else {
      p.jumpHeld = false;
    }
  }
  if (!input.isDown("jump")) {
    p.jumpHeld = false;
  }

  // ── Physics step ───────────────────────────────────────────────────────────
  stepPhysics(p, tileMap, dt, true);

  // ── World bounds ───────────────────────────────────────────────────────────
  if (p.x < 0) { p.x = 0; p.vx = 0; }
  if (p.x + p.width > levelPixelWidth) {
    p.x = levelPixelWidth - p.width;
    p.vx = 0;
  }

  // ── Walk animation ─────────────────────────────────────────────────────────
  if (Math.abs(p.vx) > 0.5 && p.onGround) {
    p.walkAnimTimer += dt;
    if (p.walkAnimTimer >= WALK_ANIM_SPEED) {
      p.walkAnimTimer = 0;
      p.walkAnimFrame = p.walkAnimFrame === 0 ? 1 : 0;
    }
  } else {
    p.walkAnimFrame = 0;
    p.walkAnimTimer = 0;
  }

  // ── Invincibility cooldown ─────────────────────────────────────────────────
  if (p.invincible) {
    p.invincibleTimer -= dt;
    if (p.invincibleTimer <= 0) {
      p.invincible = false;
      p.invincibleTimer = 0;
    }
  }
}

/** Make the player take damage (start invincibility window or die). */
export function hurtPlayer(p: PlayerState): void {
  if (p.invincible || p.dead) return;
  killPlayer(p);
}

/** Instantly kill the player. */
export function killPlayer(p: PlayerState): void {
  p.dead = true;
  p.deadTimer = 1.5; // seconds of death animation
  p.vy = -10;        // bounce up
  p.vx = 0;
  p.onGround = false;
}

/** Grant invincibility after taking a hit. */
export function grantInvincibility(p: PlayerState): void {
  p.invincible = true;
  p.invincibleTimer = PLAYER_INVINCIBLE_DURATION;
}
