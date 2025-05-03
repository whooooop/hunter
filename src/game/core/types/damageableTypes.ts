import { Enemy } from "./enemyTypes";
import { WeaponType } from "../../weapons/WeaponTypes";

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
    distance: number;
    weaponName: WeaponType;
  }

  export interface DamageResult {
    health: number;
    isDead: boolean;
    isPenetrated: boolean;
    permeability: number;
    target: Enemy.Body;
    oneShotKill: boolean;
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
