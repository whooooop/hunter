import { Enemy } from "./enemyTypes";

export namespace Damageable {
  export interface Config {
    health: number;
    permeability: number;
  }

  export interface Damage {
    value: number;
    forceVector: number[][];
    hitPoint: number[];
    simulate: boolean;
    playerId: string;
    weaponName: string;
  }

  export interface DamageResult {
    health: number;
    isDead: boolean;
    isPenetrated: boolean;
    permeability: number;
    target: Enemy.Body;
  }

  export interface Body {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Entity {
    takeDamage(damage: Damage): DamageResult | null;
    getBodyBounds(): Body;
    getDead(): boolean;
    update(time: number, delta: number): void;
  }
}
