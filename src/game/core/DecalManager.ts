export class DecalManager {
  private texture: Phaser.GameObjects.RenderTexture;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.texture = scene.add.renderTexture(x, y, width, height);
    this.texture.setOrigin(0, 0);
  }

  public setDepth(depth: number): void { 
    this.texture.setDepth(depth);
  }

  public drawParticle(particle: Phaser.GameObjects.Sprite, x: number, y: number): void {
    this.texture.draw(particle, x, y);
  }
}

