export interface ShadowEntityOptions {
  scale?: [number, number];
  offset?: [number, number];
  color?: number;
  alpha?: number;
}

const defaultOptions: ShadowEntityOptions = {
  scale: [0.9, 0.3],
  offset: [0, 0],
  color: 0x000000,
  alpha: 0.1
}

export class ShadowEntity {
  private container: Phaser.GameObjects.Container;
  private ellipse: Phaser.GameObjects.Ellipse;

  constructor(
    scene: Phaser.Scene, 
    body: Phaser.Physics.Arcade.Body,
    config?: ShadowEntityOptions
  ) {
    config = { ...defaultOptions, ...config };

    const width = body.width * config.scale![0];
    const height = body.height * config.scale![1];

    this.container = scene.add.container(0, 0);
    this.ellipse = scene.add.ellipse(config.offset![0], config.offset![1], width, height, config.color, config.alpha);

    this.container.add(this.ellipse);
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
