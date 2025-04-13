export class ShadowEntity extends Phaser.GameObjects.Ellipse {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private offsetX: number;
  private offsetY: number;

  constructor(
    scene: Phaser.Scene, 
    gameObject: Phaser.Physics.Arcade.Sprite,
    offsetX: number = 0,
    offsetY: number = 4,
    fillColor: number = 0x000000,
    fillAlpha: number = 0.1
  ) {
    super(scene, 0, 0, gameObject.width * 0.9, gameObject.height * 0.3, fillColor, fillAlpha);
    this.gameObject = gameObject;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.setScale(gameObject.scale);
    scene.add.existing(this);
  }

  public update(time: number, delta: number): void {
    const scale = this.gameObject.scale;
    this
      .setPosition(this.gameObject.x + this.offsetX, this.gameObject.y + this.gameObject.height * scale / 2 + this.offsetY)
      .setScale(this.gameObject.scale)
      .setDepth(this.gameObject.depth - 1);
  }
}