import { CameraState, PlayerState } from "@/entities/types";
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  CAMERA_LERP,
  CAMERA_LEAD_X,
  CAMERA_LEAD_Y,
} from "@/utils/constants";
import { clamp, lerp } from "@/utils/math";

export class Camera {
  x = 0;
  y = 0;

  private levelPixelWidth = 0;
  private levelPixelHeight = 0;

  init(levelPixelWidth: number, levelPixelHeight: number): void {
    this.levelPixelWidth = levelPixelWidth;
    this.levelPixelHeight = levelPixelHeight;
    this.x = 0;
    this.y = 0;
  }

  update(player: PlayerState): void {
    // Target x: keep player a fixed distance from the left edge
    const targetX = player.x + player.width / 2 - CAMERA_LEAD_X;
    const targetY = player.y + player.height / 2 - CAMERA_LEAD_Y;

    this.x = lerp(this.x, targetX, CAMERA_LERP);
    this.y = lerp(this.y, targetY, CAMERA_LERP);

    // Clamp within level bounds
    this.x = clamp(this.x, 0, Math.max(0, this.levelPixelWidth - VIRTUAL_WIDTH));
    this.y = clamp(this.y, 0, Math.max(0, this.levelPixelHeight - VIRTUAL_HEIGHT));
  }

  /** Convert world position → screen position. */
  toScreen(worldX: number, worldY: number): { sx: number; sy: number } {
    return { sx: worldX - this.x, sy: worldY - this.y };
  }

  /** Axis-aligned bounding-box test – skip objects far off-screen. */
  isVisible(worldX: number, worldY: number, w: number, h: number): boolean {
    return (
      worldX + w > this.x &&
      worldX < this.x + VIRTUAL_WIDTH &&
      worldY + h > this.y &&
      worldY < this.y + VIRTUAL_HEIGHT
    );
  }

  snapshot(): CameraState {
    return { x: this.x, y: this.y };
  }
}
