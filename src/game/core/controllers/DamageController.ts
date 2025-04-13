import { Demage } from "../types/demage";

export interface DamageControllerOptions {
  health: number;
}

export class DamageController {
  protected isDead: boolean = false;
  protected health: number;
  protected initialHealth: number;

  constructor(options: DamageControllerOptions) {
    this.health = options.health;
    this.initialHealth = options.health;
  }

  public getHealth(): number {
    return this.health;
  }

  public getHealthPercent(): number {
    return this.health / this.initialHealth;
  }

  public getDead(): boolean {
    return this.isDead;
  }

  protected onDeath(): void {
    this.isDead = true;
  }

  public takeDamage(damage: Demage) {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - damage.value);

    if (this.health === 0) {
      this.onDeath();
    }
  }
}