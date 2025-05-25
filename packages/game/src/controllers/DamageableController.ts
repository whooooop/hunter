import { Damageable } from "../types/damageableTypes";
import { Enemy } from "../types/enemyTypes";

export class DamageableController {
  protected isDead: boolean = false;
  protected permeability: number;
  protected health: number;
  protected initialHealth: number;
  protected damages: { damage: Damageable.Damage, result: Damageable.DamageResult }[] = [];

  constructor(config: Damageable.Config) {
    this.permeability = config.permeability;
    this.health = config.health;
    this.initialHealth = config.health;
  }

  public getHealth(): number {
    return this.health;
  }

  public getHealthPercent(): number {
    return this.health / this.initialHealth;
  }

  public getLastDamage(): { damage: Damageable.Damage, result: Damageable.DamageResult } | null {
    return this.damages[this.damages.length - 1] || null;
  }

  public getDamages(): { damage: Damageable.Damage, result: Damageable.DamageResult }[] {
    return this.damages;
  }

  public takeDamage(damage: Damageable.Damage, target: Enemy.Body): Damageable.DamageResult | null {
    if (this.isDead) return null;

    const health = Math.max(0, this.health - damage.value);
    const isDead = health === 0;
    const result = {
      health,
      isDead,
      permeability: this.permeability,
      isPenetrated: !!this.permeability || isDead,
      oneShotKill: isDead && !this.damages.length,
      target
    }

    if (!damage.simulate) {
      this.health = health;
      this.isDead = isDead;
      this.damages.push({ damage, result });
    }

    return result;
  }

  public getDead(): boolean {
    return this.isDead;
  }
}
