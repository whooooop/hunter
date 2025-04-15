import { DamageController, DamageControllerOptions } from "../controllers/DamageController";
import { Demage } from "../types/demage";

export interface DamageResult {
  health: number;
  isDead: boolean;
  isPenetrated: boolean;
  permeability: number;
}

export class DamageableEntity {
  protected damageController: DamageController;
  protected isDead: boolean = false;
  protected gameObject: Phaser.Physics.Arcade.Sprite;
  protected permeability: number;

  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DamageControllerOptions) {
    this.gameObject = gameObject;
    this.permeability = options.permeability;
    this.damageController = new DamageController(options);
  }

  public takeDamage(damage: Demage): DamageResult | null {
    if (this.isDead) return null;

    this.damageController.takeDamage(damage);
    this.isDead = this.damageController.getDead();

    return {
      health: this.damageController.getHealth(),
      isDead: this.isDead,
      permeability :this.permeability,
      isPenetrated: !!this.permeability || this.isDead
    };
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
