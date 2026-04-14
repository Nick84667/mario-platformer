# Mario Platformer

A browser-playable 2D platformer inspired by Super Mario, built from scratch with **Next.js 15**, **TypeScript**, **HTML5 Canvas**, and **Zustand**. Zero external assets — all sprites are drawn procedurally and all audio is generated via the Web Audio API.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- Custom physics engine (AABB tile-based collision, no Matter.js)
- Procedural sprite rendering — no image files
- Procedural audio — no audio files (Web Audio API)
- 2 handcrafted levels with a JSON-based level format
- Goomba AI (patrol, edge detection, wall bounce)
- Question blocks, brick breaking, coin collection
- Stomp combo scoring, floating score popups
- Side-scrolling lerp camera
- Mobile touch controls (on-screen D-pad + A/B buttons)
- Built-in Level Editor (paste JSON → hot-load)
- 60 FPS stable, minimal React re-renders

---

## Getting Started

```bash
git clone https://github.com/Rahul96A/mario-platformer.git
cd mario-platformer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Controls

| Action | Keys |
|--------|------|
| Move   | `← →` / `A D` |
| Jump   | `Space` / `↑` / `W` |
| Run    | `Shift` / `Z` |
| Pause  | `P` / `Esc` |
| Start  | `Enter` |

Mobile users get on-screen buttons automatically.

---

## Architecture

```
/app               Next.js App Router pages & layout
/components
  /canvas          GameCanvas — canvas host + overlay compositor
  /ui              HUD, menus, touch controls, level editor
/engine
  GameEngine.ts    Orchestrator — owns all mutable game state
  Physics.ts       Tile-based AABB physics + collision resolution
  Camera.ts        Side-scrolling camera (lerp + clamped bounds)
  Renderer.ts      All Canvas 2D draw calls (procedural sprites)
  InputManager.ts  Keyboard + virtual touch input
  AudioManager.ts  Web Audio API — procedural sound effects
/entities
  types.ts         Shared interfaces & enums
  Player.ts        Movement, jump, invincibility
  Enemy.ts         Goomba patrol AI, stomp / knockback
  Particle.ts      Particle system + floating score popups
/hooks
  useGame.ts       Bootstraps engine, bridges Zustand store
/levels
  types.ts         LevelDef schema
  level1.json      World 1-1
  level2.json      World 1-2
  LevelLoader.ts   JSON → Uint8Array tile grid + entity arrays
/store
  gameStore.ts     Zustand — score, lives, coins, game status
/utils
  constants.ts     Physics, camera, scoring constants
  math.ts          clamp, lerp, AABB helpers
  colors.ts        Centralised colour palette
```

### Key design decisions

| Concern | Approach |
|---------|---------|
| Rendering | Fixed 800×450 virtual resolution scaled to viewport |
| Game loop | `requestAnimationFrame` with delta-time capped at 50 ms |
| Physics | Custom — separate X / Y collision passes |
| State | Engine owns all mutable state; Zustand is UI-only (overlays) |
| React isolation | Canvas never touched by React |

---

## Level Format

```json
{
  "id": 1,
  "name": "My Level",
  "width": 60,
  "height": 14,
  "background": "day",
  "timeLimit": 300,
  "playerStart": { "col": 3, "row": 12 },
  "goal":        { "col": 55, "row": 12 },
  "regions": [
    { "col": 0, "row": 12, "w": 60, "h": 2, "type": 1 }
  ],
  "blocks":  [{ "col": 10, "row": 8, "type": "question", "coin": true }],
  "pipes":   [{ "col": 20, "row": 12, "height": 2 }],
  "enemies": [{ "type": "goomba", "col": 15, "row": 12 }],
  "coins":   [{ "col": 8, "row": 10 }]
}
```

**Tile types**: `0` Air · `1` Ground · `2` Brick · `3` Question block · `5` Pipe top · `6` Pipe body

Use the in-game **Level Editor** (🗺 button) to paste and hot-load custom JSON instantly.

---

## Adding a New Level

1. Create `levels/level3.json` following the schema above.
2. Import and register it in `hooks/useGame.ts`:

```ts
import level3 from "@/levels/level3.json";
const LEVEL_DEFS = [level1, level2, level3] as LevelDef[];
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint check |

---

## Deployment

Deploys as a fully-static Next.js app — no server required.

```bash
vercel deploy
```

---


