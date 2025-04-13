import { DamageController, DamageControllerOptions } from "../controllers/DamageController";
import { Demage } from "../types/demage";

export class DamageableEntity {
  protected damageController: DamageController;
  protected isDead: boolean = false;
  protected gameObject: Phaser.Physics.Arcade.Sprite;
  
  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DamageControllerOptions) {
    this.gameObject = gameObject;
    this.damageController = new DamageController(options);
  }

  public takeDamage(damage: Demage): void {
    this.damageController.takeDamage(damage);
    this.isDead = this.damageController.getDead();
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return this.gameObject.getBounds();
  }

  public getDead(): boolean {
    return this.damageController.getDead();
  }

  public update(time: number, delta: number): void {}

  public destroy(): void {}
}
