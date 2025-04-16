import { Demage } from "../types/demage";


export interface DamageableEntityOptions {
  health: number;
  permeability: number;
}

export interface DamageResult {
  health: number;
  isDead: boolean;
  isPenetrated: boolean;
  permeability: number;
}

export class DamageableEntity {
  protected isDead: boolean = false;
  protected gameObject: Phaser.Physics.Arcade.Sprite;
  protected permeability: number;
  protected health: number;
  protected initialHealth: number;

  constructor(gameObject: Phaser.Physics.Arcade.Sprite, options: DamageableEntityOptions) {
    this.gameObject = gameObject;
    this.permeability = options.permeability;
    this.health = options.health;
    this.initialHealth = options.health;
  }

  public getHealth(): number {
    return this.health;
  }

  public getHealthPercent(): number {
    return this.health / this.initialHealth;
  }

  public takeDamage(damage: Demage): DamageResult | null {
    if (this.isDead) return null;

    this.health = Math.max(0, this.health - damage.value);

    if (this.health === 0) {
      this.isDead = true;
      this.onDeath();
    }

    return {
      health: this.health,
      isDead: this.isDead,
      permeability :this.permeability,
      isPenetrated: !!this.permeability || this.isDead
    };
  }

  protected onDeath() {}

  public getBounds(): Phaser.Geom.Rectangle {
    return this.gameObject.getBounds();
  }

  public getDead(): boolean {
    return this.isDead;
  }

  public update(time: number, delta: number): void {}

  public destroy(): void {}
}
