// Centralised colour palette – no hardcoded hex strings in draw code.

export const Colors = {
  // Sky / background
  skyTop: "#1a6bc4",
  skyBottom: "#5c94fc",

  // Ground
  groundTop: "#52a529",
  groundMid: "#8B6914",
  groundEdge: "#6d5010",

  // Brick
  brickFace: "#c84c0c",
  brickMortar: "#8c3408",
  brickHighlight: "#e05818",

  // Question block
  qBlockFace: "#e8a818",
  qBlockEdge: "#945c00",
  qBlockHighlight: "#fcd860",
  qBlockHit: "#8c7040",

  // Pipe
  pipeGreen: "#3c8c14",
  pipeGreenLight: "#5cb820",
  pipeGreenDark: "#286008",
  pipeBorder: "#1c4804",

  // Player
  playerSkin: "#ffcc99",
  playerHat: "#e52521",
  playerShirt: "#e52521",
  playerOveralls: "#049cd8",
  playerShoe: "#6b3a2a",
  playerEye: "#000000",
  playerMustache: "#6b3a2a",

  // Enemy (Goomba)
  goombaBody: "#8c5014",
  goombaFeet: "#6b3a2a",
  goombaEye: "#ffffff",
  goombaPupil: "#000000",
  gombaEyebrow: "#4a2000",

  // Coin
  coinOuter: "#e8a818",
  coinInner: "#fcd860",

  // Particles
  particleCoin: "#fcd860",
  particleBrick: "#c84c0c",
  particleScore: "#ffffff",

  // Goal flag
  goalPole: "#888888",
  goalFlag: "#43b047",

  // HUD
  hudBg: "rgba(0,0,0,0.55)",
  hudText: "#ffffff",
  hudCoin: "#fcd860",

  // Overlays
  overlayBg: "rgba(0,0,0,0.72)",
  overlayTitle: "#fbd000",
  overlayText: "#ffffff",
  overlayHighlight: "#e52521",

  // Cloud
  cloud: "#ffffff",

  // Hill
  hillDark: "#3ea020",
  hillLight: "#52b82c",
} as const;

export type ColorName = keyof typeof Colors;
