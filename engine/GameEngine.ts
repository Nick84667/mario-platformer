// ─── GameEngine ───────────────────────────────────────────────────────────────
// The single source of truth for all game state.
// React components communicate via the Zustand store (read-only from React side).

import { Camera } from "./Camera";
import { InputManager } from "./InputManager";
import { Renderer } from "./Renderer";
import { AudioManager } from "./AudioManager";
import { stepPhysics } from "./Physics";

import {
  PlayerState,
  EnemyState,
  CoinState,
  ParticleState,
  ScorePopup,
  TileType,
  GameStatus,
} from "@/entities/types";
import { updatePlayer, killPlayer } from "@/entities/Player";
import { updateEnemy, stompEnemy } from "@/entities/Enemy";
import {
  updateParticles,
  updateScorePopups,
  spawnBrickParticles,
  spawnCoinParticles,
  spawnStarParticles,
  spawnScorePopup,
} from "@/entities/Particle";
import { loadLevel, LoadedLevel, questionBlockCoins } from "@/levels/LevelLoader";
import { LevelDef } from "@/levels/types";
import { rectsOverlap } from "@/utils/math";
import {
  TILE_SIZE,
  COIN_SCORE,
  ENEMY_KILL_SCORE,
  COIN_QUESTION_BONUS,
  COIN_BOB_SPEED,
  LIVES_START,
} from "@/utils/constants";

// ── Zustand bridge ──────────────────────────────────────────────────────────
// Minimal snapshot of store state the engine writes each frame.
interface StoreSnapshot {
  status: GameStatus;
  score: number;
  lives: number;
  coins: number;
  level: number;
  timeLeft: number;
}
type StoreUpdater = (snapshot: StoreSnapshot) => void;

// ─── Game loop ────────────────────────────────────────────────────────────────

class GameLoop {
  private rafId = 0;
  private lastTime = 0;

  constructor(private tick: (dt: number) => void) {}

  start(): void {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    cancelAnimationFrame(this.rafId);
  }

  private loop = (now: number): void => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50 ms
    this.lastTime = now;
    this.tick(dt);
    this.rafId = requestAnimationFrame(this.loop);
  };
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export class GameEngine {
  private camera = new Camera();
  private input: InputManager;
  private renderer: Renderer;
  private audio: AudioManager;
  private loop: GameLoop;

  private player!: PlayerState;
  private enemies: EnemyState[] = [];
  private coins: CoinState[] = [];
  private particles: ParticleState[] = [];
  private scorePopups: ScorePopup[] = [];
  private loadedLevel!: LoadedLevel;
  private levelDefs: LevelDef[] = [];
  private currentLevelIndex = 0;

  // Counters
  private score = 0;
  private lives = LIVES_START;
  private coinCount = 0;
  private timeLeft = 400;
  private timeAccum = 0;
  private status: GameStatus = GameStatus.Start;

  // Timers
  private respawnTimer = 0;
  private levelCompleteTimer = 0;
  private stompComboTimer = 0;
  private stompComboCount = 0;

  // Zustand updater (set once by useGame hook)
  private onStoreUpdate: StoreUpdater | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    input: InputManager,
    audio: AudioManager,
  ) {
    this.input = input;
    this.audio = audio;
    this.renderer = new Renderer(canvas);
    this.loop = new GameLoop(this.tick);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  setStoreUpdater(fn: StoreUpdater): void {
    this.onStoreUpdate = fn;
  }

  loadLevels(defs: LevelDef[]): void {
    this.levelDefs = defs;
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  resize(w: number, h: number): void {
    this.renderer.resize(w, h);
  }

  startGame(): void {
    this.score = 0;
    this.lives = LIVES_START;
    this.coinCount = 0;
    this.currentLevelIndex = 0;
    this.initLevel();
    this.setStatus(GameStatus.Playing);
  }

  togglePause(): void {
    if (this.status === GameStatus.Playing) {
      this.setStatus(GameStatus.Paused);
      this.input.flush();
    } else if (this.status === GameStatus.Paused) {
      this.setStatus(GameStatus.Playing);
      this.input.flush();
    }
  }

  restartGame(): void {
    this.startGame();
  }

  // ── Level management ────────────────────────────────────────────────────────

  private initLevel(): void {
    const def = this.levelDefs[this.currentLevelIndex];
    if (!def) return;

    questionBlockCoins.clear();

    this.loadedLevel = loadLevel(def, this.onTileBump);
    this.camera.init(
      this.loadedLevel.levelPixelWidth,
      this.loadedLevel.levelPixelHeight,
    );
    this.player = this.loadedLevel.player;
    this.enemies = this.loadedLevel.enemies;
    this.coins = this.loadedLevel.coins;
    this.particles = [];
    this.scorePopups = [];
    this.timeLeft = def.timeLimit;
    this.timeAccum = 0;
    this.respawnTimer = 0;
    this.levelCompleteTimer = 0;
    this.stompComboTimer = 0;
    this.stompComboCount = 0;

    this.syncStore();
  }

  private nextLevel(): void {
    this.currentLevelIndex++;
    if (this.currentLevelIndex >= this.levelDefs.length) {
      this.currentLevelIndex = 0;
      this.score = 0;
      this.lives = LIVES_START;
      this.coinCount = 0;
    }
    this.initLevel();
    this.setStatus(GameStatus.Playing);
  }

  // ── Tile bump (called by Physics when player hits a tile from below) ────────

  private onTileBump = (col: number, row: number): void => {
    const { tileMap } = this.loadedLevel;
    const idx = row * tileMap.cols + col;
    const type = tileMap.grid[idx] as TileType;
    const wx = col * TILE_SIZE;
    const wy = row * TILE_SIZE;

    if (type === TileType.Brick) {
      tileMap.grid[idx] = TileType.Air;
      spawnBrickParticles(wx, wy, this.particles);
      this.addScore(50, wx + 16, wy);
      this.audio.play("brickBreak");
    } else if (type === TileType.QuestionBlock) {
      tileMap.grid[idx] = TileType.QuestionBlockHit;
      const hasCoin = questionBlockCoins.get(`${col},${row}`);
      if (hasCoin) {
        this.coinCount = (this.coinCount + 1) % 100;
        this.addScore(COIN_QUESTION_BONUS, wx + 16, wy - 16);
        spawnCoinParticles(wx, wy - TILE_SIZE, this.particles);
        this.audio.play("coin");
        this.syncStore();
      }
      spawnStarParticles(wx, wy, this.particles);
      this.audio.play("questionBlock");
    }
  };

  // ── Main tick ───────────────────────────────────────────────────────────────

  private tick = (dt: number): void => {
    this.input.update();

    switch (this.status) {
      case GameStatus.Start:
        this.tickStart();
        break;
      case GameStatus.Playing:
        this.tickPlaying(dt);
        break;
      case GameStatus.Paused:
        this.tickPaused();
        break;
      case GameStatus.GameOver:
        this.tickGameOver();
        break;
      case GameStatus.LevelComplete:
        this.tickLevelComplete(dt);
        break;
    }

    this.renderFrame();
  };

  private tickStart(): void {
    if (this.input.isPressed("start") || this.input.isPressed("jump")) {
      this.startGame();
    }
  }

  private tickPaused(): void {
    if (this.input.isPressed("pause") || this.input.isPressed("start")) {
      this.togglePause();
    }
  }

  private tickGameOver(): void {
    if (this.input.isPressed("start") || this.input.isPressed("jump")) {
      this.setStatus(GameStatus.Start);
    }
  }

  private tickLevelComplete(dt: number): void {
    this.levelCompleteTimer -= dt;
    if (this.levelCompleteTimer <= 0) {
      this.nextLevel();
    }
    this.camera.update(this.player);
    updateParticles(this.particles, dt);
    updateScorePopups(this.scorePopups, dt);
  }

  private tickPlaying(dt: number): void {
    if (this.input.isPressed("pause")) {
      this.togglePause();
      return;
    }

    // ── Respawn delay ────────────────────────────────────────────────────────
    if (this.respawnTimer > 0) {
      this.respawnTimer -= dt;
      if (this.player.dead) {
        this.player.deadTimer -= dt;
        stepPhysics(this.player, this.loadedLevel.tileMap, dt, false);
      }
      if (this.respawnTimer <= 0) {
        if (this.lives <= 0) {
          this.audio.play("gameOver");
          this.setStatus(GameStatus.GameOver);
          this.syncStore();
        } else {
          this.initLevel();
          this.setStatus(GameStatus.Playing);
        }
      }
      return;
    }

    // ── Countdown timer ──────────────────────────────────────────────────────
    this.timeAccum += dt;
    if (this.timeAccum >= 1) {
      this.timeAccum -= 1;
      this.timeLeft = Math.max(0, this.timeLeft - 1);
      if (this.timeLeft === 0) {
        this.handlePlayerDeath();
      }
    }

    // ── Entities ────────────────────────────────────────────────────────────
    updatePlayer(
      this.player,
      this.input,
      this.loadedLevel.tileMap,
      dt,
      this.loadedLevel.levelPixelWidth,
    );

    // Fell off world
    if (
      this.player.y > this.loadedLevel.levelPixelHeight + 64 &&
      !this.player.dead
    ) {
      this.handlePlayerDeath();
    }

    for (const enemy of this.enemies) {
      updateEnemy(enemy, this.loadedLevel.tileMap, dt);
    }
    // Prune removed enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive && e.deadTimer <= 0) this.enemies.splice(i, 1);
    }

    for (const coin of this.coins) {
      if (!coin.collected) coin.bobTimer += COIN_BOB_SPEED * dt;
    }

    updateParticles(this.particles, dt);
    updateScorePopups(this.scorePopups, dt);

    if (this.stompComboTimer > 0) {
      this.stompComboTimer -= dt;
      if (this.stompComboTimer <= 0) this.stompComboCount = 0;
    }

    // ── Collisions ───────────────────────────────────────────────────────────
    if (!this.player.dead) {
      this.checkPlayerVsCoins();
      this.checkPlayerVsEnemies();
      this.checkPlayerVsGoal();
    }

    this.camera.update(this.player);
    this.syncStore();
  }

  // ── Collision handlers ──────────────────────────────────────────────────────

  private checkPlayerVsCoins(): void {
    const p = this.player;
    for (const coin of this.coins) {
      if (coin.collected) continue;
      if (
        rectsOverlap(
          p.x, p.y, p.width, p.height,
          coin.x, coin.y, coin.width, coin.height,
        )
      ) {
        coin.collected = true;
        this.coinCount = (this.coinCount + 1) % 100;
        this.addScore(COIN_SCORE, coin.x + coin.width / 2, coin.y);
        spawnCoinParticles(coin.x, coin.y, this.particles);
        this.audio.play("coin");
        this.syncStore();
      }
    }
  }

  private checkPlayerVsEnemies(): void {
    const p = this.player;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (
        !rectsOverlap(
          p.x, p.y, p.width, p.height,
          enemy.x, enemy.y, enemy.width, enemy.height,
        )
      )
        continue;

      const playerBottom = p.y + p.height;
      const enemyCentre = enemy.y + enemy.height / 2;

      if (p.vy > 0 && playerBottom <= enemyCentre + 8) {
        // Stomp!
        stompEnemy(enemy);
        p.vy = -8;

        this.stompComboCount++;
        this.stompComboTimer = 0.6;
        const bonus = Math.min(ENEMY_KILL_SCORE * this.stompComboCount, 1600);
        this.addScore(bonus, enemy.x + enemy.width / 2, enemy.y);
        this.audio.play("stomp");
      } else {
        // Side hit – kill player
        this.handlePlayerDeath();
        this.audio.play("death");
      }
    }
  }

  private checkPlayerVsGoal(): void {
    const { goalX, goalY, goalWidth, goalHeight } = this.loadedLevel;
    if (
      rectsOverlap(
        this.player.x, this.player.y, this.player.width, this.player.height,
        goalX, goalY, goalWidth, goalHeight,
      )
    ) {
      this.handleLevelComplete();
    }
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  private handlePlayerDeath(): void {
    if (this.player.dead) return;
    killPlayer(this.player);
    this.lives--;
    this.respawnTimer = 2.0;
    this.syncStore();
  }

  private handleLevelComplete(): void {
    if (this.status === GameStatus.LevelComplete) return;
    this.setStatus(GameStatus.LevelComplete);
    this.levelCompleteTimer = 3.5;
    const bonus = Math.ceil(this.timeLeft) * 10;
    this.addScore(bonus, this.player.x, this.player.y - 32);
    this.audio.play("levelComplete");
    this.syncStore();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private addScore(amount: number, wx: number, wy: number): void {
    this.score += amount;
    spawnScorePopup(wx, wy, amount, this.scorePopups);
  }

  private setStatus(s: GameStatus): void {
    this.status = s;
    this.syncStore();
  }

  private syncStore(): void {
    this.onStoreUpdate?.({
      status: this.status,
      score: this.score,
      lives: this.lives,
      coins: this.coinCount,
      level: this.currentLevelIndex + 1,
      timeLeft: Math.ceil(this.timeLeft),
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  private renderFrame(): void {
    if (!this.loadedLevel) return;
    this.renderer.render({
      player: this.player,
      enemies: this.enemies,
      coins: this.coins,
      particles: this.particles,
      scorePopups: this.scorePopups,
      tileMap: this.loadedLevel.tileMap,
      camera: this.camera,
      level: this.levelDefs[this.currentLevelIndex],
    });
  }
}
