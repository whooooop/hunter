import { SyncCollectionRecord } from "@hunter/multiplayer/dist/Collection";
import { Damageable } from "../types/damageableTypes";
import { Enemy } from "../types/enemyTypes";

export class DamageableController {
  protected isDead: boolean = false;
  protected permeability: number;
  protected health: number;
  protected initialHealth: number;
  protected state: SyncCollectionRecord<{ health: number }> | null = null;
  protected damages: { damage: Damageable.Damage, result: Damageable.DamageResult }[] = [];

  constructor(config: Damageable.Config) {
    this.permeability = config.permeability;
    this.health = config.health;
    this.initialHealth = config.health;
  }

  public setState(state: SyncCollectionRecord<{ health: number }>) {
    this.state = state;
    this.health = state.data.health;
    this.initialHealth = state.data.health;
  }

  public getHealth(): number {
    return this.state?.data.health || this.health;
  }

  private setHealth(health: number) {
    this.health = health;
    if (this.state) {
      this.state.data.health = health;
    }
  }

  public getHealthPercent(): number {
    return this.getHealth() / this.initialHealth;
  }

  public getLastDamage(): { damage: Damageable.Damage, result: Damageable.DamageResult } | null {
    return this.damages[this.damages.length - 1] || null;
  }

  public getDamages(): { damage: Damageable.Damage, result: Damageable.DamageResult }[] {
    return this.damages;
  }

  public takeDamage(damage: Damageable.Damage, target: Enemy.Body): Damageable.DamageResult | null {
    if (this.isDead) return null;

    const health = Math.max(0, this.getHealth() - damage.value);
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
      this.setHealth(health);
      this.isDead = isDead;
      this.damages.push({ damage, result });
    }

    return result;
  }

  public getDead(): boolean {
    return this.isDead;
  }
}
