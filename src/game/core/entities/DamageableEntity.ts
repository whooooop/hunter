import { Demage } from "../types/demage";


export interface DamageableEntityOptions {
  health: number;
  permeability: number;
}

export interface DamageableEntityBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DamageResult {
  health: number;
  isDead: boolean;
  isPenetrated: boolean;
  permeability: number;
}

export class DamageableEntity {
  protected id: string;
  protected isDead: boolean = false;
  protected gameObject: Phaser.Physics.Arcade.Sprite;
  protected permeability: number;
  protected health: number;
  protected initialHealth: number;

  constructor(gameObject: Phaser.Physics.Arcade.Sprite, id: string, options: DamageableEntityOptions) {
    this.id = id;
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

    const health = Math.max(0, this.health - damage.value);
    const isDead = health === 0;

    if (!damage.simulate) {
      this.health = health;
      this.isDead = isDead;
      if (isDead) {
        this.onDeath();
      }
    }

    return {
      health,
      isDead,
      permeability: this.permeability,
      isPenetrated: !!this.permeability || isDead
    };
  }

  protected onDeath() {}

  public getBounds(): DamageableEntityBounds {
    const bounds = this.gameObject.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }

  public getDead(): boolean {
    return this.isDead;
  }

  public update(time: number, delta: number): void {}

  public destroy(): void {}
}
