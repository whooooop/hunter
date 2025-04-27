export interface ShadowEntityOptions {
  scale?: [number, number];
  offset?: [number, number];
  color?: number;
  alpha?: number;
}

const defaultOptions: ShadowEntityOptions = {
  scale: [0.9, 0.3],
  offset: [0, 4],
  color: 0x000000,
  alpha: 0.1
}

export class ShadowEntity extends Phaser.GameObjects.Ellipse {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private options: ShadowEntityOptions;

  constructor(
    scene: Phaser.Scene, 
    gameObject: Phaser.Physics.Arcade.Sprite,
    options?: ShadowEntityOptions
  ) {
    const _options: ShadowEntityOptions = { ...defaultOptions, ...options };
    super(scene, 0, 0, 0, 0, _options.color, _options.alpha);

    this.gameObject = gameObject;
    this.options = _options;
    this.setScale(gameObject.scale);
    scene.add.existing(this);
  }

  public update(time: number, delta: number, offsetY: number = 0): void {
    const scale = this.gameObject.scale;
    this
      .setPosition(this.gameObject.x + this.options.offset![0], this.gameObject.y + this.gameObject.height * scale / 2 + this.options.offset![1] - offsetY)
      .setSize(this.gameObject.width * this.options.scale![0], this.gameObject.height * this.options.scale![1])
      .setScale(this.gameObject.scale)
      .setDepth(this.gameObject.depth - 1);
  }
}
