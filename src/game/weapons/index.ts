import { EnemyEntity } from "../core/entities/EnemyEntity";
import { generateId } from "../../utils/stringGenerator";
import { Glock } from "./glock/Glock";
import { MP5 } from "./MP5/MP5";
import { Grenade } from "./grenade/Grenade";
import { Sawed } from "./sawed/Sawed";
import { WeaponMine } from "./mine/WeaponMine";
import { WeaponAWP } from "./AWP/WeaponAWP";

export enum WeaponType {
  GLOCK = 'glock',
  MP5 = 'mp5',
  GRENADE = 'grenade',
  SAWED = 'sawed',
  MINE = 'mine',
  AWP = 'awp',
}

export const WeaponCollection = {
  [WeaponType.GLOCK]: Glock,
  [WeaponType.MP5]: MP5,
  [WeaponType.GRENADE]: Grenade,
  [WeaponType.SAWED]: Sawed,
  [WeaponType.MINE]: WeaponMine,
  [WeaponType.AWP]: WeaponAWP,
}

export function preloadWeapons(scene: Phaser.Scene): void {
  Object.values(WeaponCollection).forEach(WeaponClass => {
    WeaponClass.preload(scene);
  });
}

// export function createWeapon(weaponType: WeaponType, scene: Phaser.Scene, x: number, y: number, options?: any): WeaponEntity {
//   const WeaponClass = WeaponCollection[weaponType];
//   const id = generateId();
//   return new WeaponClass(scene, id, x, y, options);
// }