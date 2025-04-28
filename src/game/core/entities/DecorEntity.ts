import { settings } from "../../settings";
import { hexToNumber } from "../../utils/colors";
import { DamageableController } from "../controllers/DamageableController";
import { Damageable } from "../types/damageableTypes";
import { Decor } from "../types/decorTypes";

export class DecorEntity implements Damageable.Entity {
  protected id: string;
  protected gameObject: Phaser.Physics.Arcade.Sprite;
  protected damageableController: DamageableController;
  protected debugGraphics: Phaser.GameObjects.Graphics | null = null;
  protected debug: boolean = false;

  constructor(gameObject: Phaser.Physics.Arcade.Sprite, id: string, config: Decor.Config) {
    this.gameObject = gameObject;
    this.id = id;

    this.damageableController = new DamageableController({
      health: config.health,
      permeability: typeof config.permeability === 'number' ? config.permeability : 1
    });

    this.gameObject.setDepth(
      this.gameObject.y + this.gameObject.height / 2 * this.gameObject.scale + settings.gameplay.depthOffset + (config.depthOffset || 0) * this.gameObject.scale
    );

    if (this.debug) {
      const bonds = this.getBodyBounds();
      this.debugGraphics = this.gameObject.scene.add.graphics();
      this.debugGraphics.setDepth(1000);
      this.debugGraphics.fillStyle(hexToNumber('#d23a3a'));
      this.debugGraphics.fillRect(this.gameObject.x - this.gameObject.width / 2, this.gameObject.depth, this.gameObject.width, 1);

      this.debugGraphics.lineStyle(1, hexToNumber('#d23a3a'), 1);
      this.debugGraphics.strokeRect(bonds.x, bonds.y, bonds.width, bonds.height);
    }
  }

  public takeDamage(damage: Damageable.Damage): Damageable.DamageResult | null {
    return this.damageableController.takeDamage(damage, 'body');
  }

  public getDead(): boolean {
    return this.damageableController.getDead();
  }

  public update(time: number, delta: number): void {}

  public getBodyBounds(): Damageable.Body {
    const width = this.gameObject.width * this.gameObject.scale;
    const height = this.gameObject.height * this.gameObject.scale;
    return {
      x: this.gameObject.x - width / 2,
      y: this.gameObject.y - height / 2,
      width,
      height,
    };
  }
}