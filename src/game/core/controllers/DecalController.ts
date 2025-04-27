import { offEvent, onEvent } from "../Events";
import { Decals } from "../types/decals";

export class DecalController {
  private texture: Phaser.GameObjects.RenderTexture;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number) {
    this.scene = scene;
    this.texture = scene.add.renderTexture(x, y, width, height);
    this.texture
      .setOrigin(0, 0)
      .setDepth(depth);

    onEvent(scene, Decals.Events.Local, this.handleDrowDecal, this);
  }

  public drawParticle(particle: Phaser.GameObjects.Sprite, x: number, y: number): void {
    this.texture.draw(particle, x, y);
  }

  private handleDrowDecal(payload: Decals.Events.Payload): void {
    this.drawParticle(payload.object, payload.x, payload.y);
  }

  public destroy(): void {
    this.texture.destroy();
    offEvent(this.scene, Decals.Events.Local, this.handleDrowDecal, this);
  }
}

