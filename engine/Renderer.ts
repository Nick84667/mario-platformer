// ─── Renderer ─────────────────────────────────────────────────────────────────
// Draws everything onto the HTML5 Canvas using the 2D API.
// All sprites are procedurally generated – no external image assets.

import {
  TileType,
  PlayerState,
  EnemyState,
  CoinState,
  ParticleState,
  ScorePopup,
} from "@/entities/types";
import { Camera } from "./Camera";
import { Colors } from "@/utils/colors";
import { TileMap } from "./Physics";
import { TILE_SIZE, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "@/utils/constants";
import { LevelDef } from "@/levels/types";

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function fillRect(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function outlinedRect(
  ctx: CanvasRenderingContext2D,
  fill: string,
  stroke: string,
  x: number,
  y: number,
  w: number,
  h: number,
  lw = 1,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
}

// ─── Background ───────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, camX: number): void {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
  grad.addColorStop(0, Colors.skyTop);
  grad.addColorStop(1, Colors.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Parallax hills (far layer – 0.2 scroll rate)
  drawHills(ctx, camX * 0.2, VIRTUAL_HEIGHT - 80, Colors.hillDark, 120, 45);
  // Parallax hills (near layer – 0.4 scroll rate)
  drawHills(ctx, camX * 0.4, VIRTUAL_HEIGHT - 60, Colors.hillLight, 90, 35);
  // Parallax clouds (0.3 scroll rate)
  drawClouds(ctx, camX * 0.3);
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  offset: number,
  baseY: number,
  color: string,
  spacing: number,
  height: number,
): void {
  ctx.fillStyle = color;
  const start = -((offset % spacing) + spacing);
  for (let x = start; x < VIRTUAL_WIDTH + spacing; x += spacing) {
    ctx.beginPath();
    ctx.ellipse(x, baseY, spacing * 0.55, height, 0, Math.PI, 0);
    ctx.fill();
    // Small bump
    ctx.beginPath();
    ctx.ellipse(x + spacing * 0.5, baseY, spacing * 0.35, height * 0.7, 0, Math.PI, 0);
    ctx.fill();
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, offset: number): void {
  const cloudPositions = [
    { x: 100, y: 60, scale: 1 },
    { x: 350, y: 40, scale: 1.4 },
    { x: 600, y: 75, scale: 0.8 },
    { x: 850, y: 50, scale: 1.2 },
    { x: 1100, y: 65, scale: 1 },
  ];
  for (const c of cloudPositions) {
    const sx = ((c.x - offset) % (VIRTUAL_WIDTH + 200)) - 100;
    drawCloud(ctx, sx, c.y, c.scale);
  }
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.fillStyle = Colors.cloud;
  const r = 18 * scale;
  const puffs = [
    { dx: 0, dy: 0, r: r * 1.3 },
    { dx: r * 1.2, dy: r * 0.2, r: r * 1.1 },
    { dx: -r * 1.2, dy: r * 0.2, r: r },
    { dx: r * 0.5, dy: -r * 0.3, r: r * 0.9 },
  ];
  for (const p of puffs) {
    ctx.beginPath();
    ctx.arc(x + p.dx, y + p.dy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Tiles ────────────────────────────────────────────────────────────────────

function drawTile(
  ctx: CanvasRenderingContext2D,
  type: TileType,
  sx: number,
  sy: number,
): void {
  const S = TILE_SIZE;
  switch (type) {
    case TileType.Ground:
      drawGroundTile(ctx, sx, sy, S);
      break;
    case TileType.Brick:
      drawBrickTile(ctx, sx, sy, S);
      break;
    case TileType.QuestionBlock:
      drawQuestionBlock(ctx, sx, sy, S, true);
      break;
    case TileType.QuestionBlockHit:
      drawQuestionBlock(ctx, sx, sy, S, false);
      break;
    case TileType.PipeTop:
      drawPipeTop(ctx, sx, sy, S);
      break;
    case TileType.PipeBody:
      drawPipeBody(ctx, sx, sy, S);
      break;
    case TileType.Goal:
      drawGoalTile(ctx, sx, sy, S);
      break;
    default:
      break;
  }
}

function drawGroundTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
): void {
  fillRect(ctx, Colors.groundMid, x, y, S, S);
  // green top strip
  fillRect(ctx, Colors.groundTop, x, y, S, 8);
  // dark edge
  fillRect(ctx, Colors.groundEdge, x, y + S - 2, S, 2);
  // subtle grid lines
  ctx.strokeStyle = Colors.groundEdge;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  ctx.strokeRect(x + 0.5, y + 0.5, S - 1, S - 1);
  ctx.globalAlpha = 1;
}

function drawBrickTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
): void {
  fillRect(ctx, Colors.brickFace, x, y, S, S);
  // Mortar lines
  ctx.fillStyle = Colors.brickMortar;
  // Horizontal
  ctx.fillRect(x, y + S / 2 - 1, S, 2);
  ctx.fillRect(x, y, S, 2);
  ctx.fillRect(x, y + S - 2, S, 2);
  // Vertical – offset rows
  ctx.fillRect(x, y, 2, S / 2);
  ctx.fillRect(x + S / 2, y, 2, S / 2);
  ctx.fillRect(x + S - 2, y, 2, S / 2);
  ctx.fillRect(x + S / 4, y + S / 2, 2, S / 2);
  ctx.fillRect(x + S * 0.75, y + S / 2, 2, S / 2);
  // highlight edge
  fillRect(ctx, Colors.brickHighlight, x, y + 2, S, 2);
}

function drawQuestionBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
  active: boolean,
): void {
  const face = active ? Colors.qBlockFace : Colors.qBlockHit;
  const edge = active ? Colors.qBlockEdge : "#555";
  const hi = active ? Colors.qBlockHighlight : "#999";

  fillRect(ctx, face, x, y, S, S);
  // borders
  fillRect(ctx, edge, x, y, S, 3); // top
  fillRect(ctx, edge, x, y + S - 3, S, 3); // bottom
  fillRect(ctx, edge, x, y, 3, S); // left
  fillRect(ctx, edge, x + S - 3, y, 3, S); // right
  // highlight
  fillRect(ctx, hi, x + 3, y + 3, S - 6, 3);
  fillRect(ctx, hi, x + 3, y + 3, 3, S - 6);

  if (active) {
    // "?" glyph
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${S * 0.55}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x + S / 2, y + S / 2 + 1);
  }
}

function drawPipeTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
): void {
  // Top cap is 2px wider on each side
  fillRect(ctx, Colors.pipeGreenDark, x - 2, y, S + 4, S);
  fillRect(ctx, Colors.pipeGreen, x - 2, y + 2, S + 4, S - 4);
  fillRect(ctx, Colors.pipeGreenLight, x, y + 4, 8, S - 8);
  fillRect(ctx, Colors.pipeBorder, x - 2, y, S + 4, 3);
  fillRect(ctx, Colors.pipeBorder, x - 2, y + S - 3, S + 4, 3);
}

function drawPipeBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
): void {
  fillRect(ctx, Colors.pipeGreenDark, x, y, S, S);
  fillRect(ctx, Colors.pipeGreen, x + 2, y, S - 4, S);
  fillRect(ctx, Colors.pipeGreenLight, x + 4, y, 8, S);
}

function drawGoalTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  S: number,
): void {
  // Flagpole base
  fillRect(ctx, Colors.goalPole, x + S / 2 - 2, y, 4, S);
  // Flag
  ctx.fillStyle = Colors.goalFlag;
  ctx.beginPath();
  ctx.moveTo(x + S / 2 + 2, y + 2);
  ctx.lineTo(x + S / 2 + 2 + 18, y + 10);
  ctx.lineTo(x + S / 2 + 2, y + 18);
  ctx.closePath();
  ctx.fill();
}

// ─── Player ───────────────────────────────────────────────────────────────────

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  cam: Camera,
): void {
  if (p.dead && p.deadTimer <= 0) return;

  const { sx, sy } = cam.toScreen(p.x, p.y);
  const w = p.width;
  const h = p.height;

  // Blink when invincible
  if (p.invincible && Math.floor(p.invincibleTimer * 10) % 2 === 0) return;

  ctx.save();
  if (!p.facingRight) {
    ctx.translate(sx + w / 2, sy + h / 2);
    ctx.scale(-1, 1);
    ctx.translate(-(sx + w / 2), -(sy + h / 2));
  }

  // Dead spin
  if (p.dead) {
    ctx.translate(sx + w / 2, sy + h / 2);
    ctx.rotate(p.deadTimer * 8);
    ctx.translate(-(sx + w / 2), -(sy + h / 2));
  }

  const x = sx;
  const y = sy;

  // Hat
  fillRect(ctx, Colors.playerHat, x + 2, y, w - 4, 8);
  fillRect(ctx, Colors.playerHat, x, y + 4, w, 6);

  // Head (skin)
  fillRect(ctx, Colors.playerSkin, x + 3, y + 6, w - 6, 12);

  // Eye
  fillRect(ctx, Colors.playerEye, x + w - 9, y + 8, 4, 3);

  // Mustache
  fillRect(ctx, Colors.playerMustache, x + w - 12, y + 14, 12, 3);

  // Shirt
  fillRect(ctx, Colors.playerShirt, x + 4, y + 16, w - 8, 9);

  // Overalls
  fillRect(ctx, Colors.playerOveralls, x + 1, y + 16, 8, 14);
  fillRect(ctx, Colors.playerOveralls, x + w - 9, y + 16, 8, 14);
  fillRect(ctx, Colors.playerOveralls, x + 4, y + 22, w - 8, 8);

  // Walk animation – leg split
  const walking = Math.abs(p.vx) > 0.5 && p.onGround;
  const legFrame = walking ? p.walkAnimFrame : 0;

  // Shoes
  const shoeOffset = legFrame === 1 ? 2 : 0;
  fillRect(ctx, Colors.playerShoe, x, y + h - 7, 10, 7 - shoeOffset);
  fillRect(ctx, Colors.playerShoe, x + w - 10, y + h - 7 + shoeOffset, 10, 7 - shoeOffset);

  ctx.restore();
}

// ─── Enemy ────────────────────────────────────────────────────────────────────

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  e: EnemyState,
  cam: Camera,
): void {
  if (!e.alive && !e.dead) return;
  if (!cam.isVisible(e.x, e.y, e.width, e.height)) return;

  const { sx, sy } = cam.toScreen(e.x, e.y);
  drawGoomba(ctx, e, sx, sy);
}

function drawGoomba(
  ctx: CanvasRenderingContext2D,
  e: EnemyState,
  sx: number,
  sy: number,
): void {
  const w = e.width;
  const h = e.dead ? 8 : e.height;
  const yOff = e.dead ? e.height - 8 : 0;

  ctx.save();
  if (e.direction === 1) {
    ctx.translate(sx + w / 2, sy + h / 2 + yOff);
    ctx.scale(-1, 1);
    ctx.translate(-(sx + w / 2), -(sy + h / 2 + yOff));
  }

  if (e.dead) {
    // Squished mushroom head
    fillRect(ctx, Colors.goombaBody, sx, sy + yOff, w, h);
    fillRect(ctx, Colors.goombaBody, sx + 2, sy + yOff - 2, w - 4, 4);
    ctx.restore();
    return;
  }

  // Body
  fillRect(ctx, Colors.goombaBody, sx + 2, sy + 6, w - 4, h - 10);

  // Head (wider mushroom cap)
  fillRect(ctx, Colors.goombaBody, sx, sy, w, 16);
  // Dark spots on cap
  fillRect(ctx, Colors.gombaEyebrow, sx + 3, sy + 1, 5, 4);
  fillRect(ctx, Colors.gombaEyebrow, sx + w - 8, sy + 1, 5, 4);

  // Eyes
  fillRect(ctx, Colors.goombaEye, sx + 3, sy + 7, 7, 7);
  fillRect(ctx, Colors.goombaEye, sx + w - 10, sy + 7, 7, 7);
  // Pupils
  fillRect(ctx, Colors.goombaPupil, sx + 7, sy + 9, 3, 4);
  fillRect(ctx, Colors.goombaPupil, sx + w - 8, sy + 9, 3, 4);

  // Eyebrows (angry)
  fillRect(ctx, Colors.gombaEyebrow, sx + 2, sy + 6, 8, 2);
  fillRect(ctx, Colors.gombaEyebrow, sx + w - 10, sy + 6, 8, 2);

  // Feet
  const frame = e.walkAnimFrame;
  const leftLegY = sy + h - 8 + (frame === 0 ? 0 : -3);
  const rightLegY = sy + h - 8 + (frame === 0 ? -3 : 0);
  fillRect(ctx, Colors.goombaFeet, sx, leftLegY, 10, 8);
  fillRect(ctx, Colors.goombaFeet, sx + w - 10, rightLegY, 10, 8);

  ctx.restore();
}

// ─── Coin ─────────────────────────────────────────────────────────────────────

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: CoinState,
  cam: Camera,
): void {
  if (coin.collected) return;
  if (!cam.isVisible(coin.x, coin.y, coin.width, coin.height)) return;

  const { sx, sy } = cam.toScreen(coin.x, coin.y);
  const cx = sx + coin.width / 2;
  const cy = sy + coin.height / 2 + Math.sin(coin.bobTimer) * 3;
  const r = coin.width / 2 - 1;

  // Outer
  ctx.fillStyle = Colors.coinOuter;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.55, r, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = Colors.coinInner;
  ctx.beginPath();
  ctx.ellipse(cx - 1, cy - 1, r * 0.3, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // "$" / coin symbol
  ctx.fillStyle = Colors.coinOuter;
  ctx.font = `bold ${r}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("¢", cx + 0.5, cy + 1);
}

// ─── Particles ────────────────────────────────────────────────────────────────

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleState,
  cam: Camera,
): void {
  if (!cam.isVisible(p.x, p.y, p.size, p.size)) return;
  const { sx, sy } = cam.toScreen(p.x, p.y);
  const alpha = p.life / p.maxLife;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.fillRect(Math.round(sx), Math.round(sy), Math.round(p.size), Math.round(p.size));
  ctx.globalAlpha = 1;
}

// ─── Score popups ─────────────────────────────────────────────────────────────

function drawScorePopup(
  ctx: CanvasRenderingContext2D,
  pop: ScorePopup,
  cam: Camera,
): void {
  const { sx, sy } = cam.toScreen(pop.x, pop.y);
  ctx.globalAlpha = pop.life;
  ctx.fillStyle = Colors.hudText;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(`+${pop.value}`, sx, sy);
  ctx.fillText(`+${pop.value}`, sx, sy);
  ctx.globalAlpha = 1;
}

// ─── Renderer class ───────────────────────────────────────────────────────────

export interface RenderPayload {
  player: PlayerState;
  enemies: EnemyState[];
  coins: CoinState[];
  particles: ParticleState[];
  scorePopups: ScorePopup[];
  tileMap: TileMap;
  camera: Camera;
  level: LevelDef;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    this.ctx = ctx;
    // Crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Scale canvas to fit screen while preserving the virtual resolution. */
  resize(displayWidth: number, displayHeight: number): void {
    const scaleX = displayWidth / VIRTUAL_WIDTH;
    const scaleY = displayHeight / VIRTUAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    this.canvas.width = VIRTUAL_WIDTH;
    this.canvas.height = VIRTUAL_HEIGHT;
    this.canvas.style.width = `${Math.floor(VIRTUAL_WIDTH * scale)}px`;
    this.canvas.style.height = `${Math.floor(VIRTUAL_HEIGHT * scale)}px`;
  }

  render(payload: RenderPayload): void {
    const { ctx } = this;
    const { player, enemies, coins, particles, scorePopups, tileMap, camera, level } = payload;

    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 1 – Background
    drawBackground(ctx, camera.x);

    // 2 – Tiles
    this.renderTiles(tileMap, camera, level);

    // 3 – Coins
    for (const coin of coins) drawCoin(ctx, coin, camera);

    // 4 – Enemies
    for (const enemy of enemies) drawEnemy(ctx, enemy, camera);

    // 5 – Player
    drawPlayer(ctx, player, camera);

    // 6 – Particles
    for (const p of particles) drawParticle(ctx, p, camera);

    // 7 – Score popups
    for (const pop of scorePopups) drawScorePopup(ctx, pop, camera);
  }

  private renderTiles(map: TileMap, camera: Camera, _level: LevelDef): void {
    const { ctx } = this;
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol = Math.min(map.cols - 1, Math.ceil((camera.x + VIRTUAL_WIDTH) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow = Math.min(map.rows - 1, Math.ceil((camera.y + VIRTUAL_HEIGHT) / TILE_SIZE));

    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const type = map.grid[row * map.cols + col] as TileType;
        if (type !== TileType.Air) {
          drawTile(ctx, type, col * TILE_SIZE, row * TILE_SIZE);
        }
      }
    }

    ctx.restore();
  }
}
