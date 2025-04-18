import { generateId } from "../../utils/stringGenerator";
import { WeaponEntity } from "../core/entities/WeaponEntity";

import { WeaponGlock } from "./Glock";
import { WeaponMP5 } from "./MP5";
import { WeaponGrenade } from "./Grenade";
import { WeaponSawed } from "./Sawed";
import { WeaponMine } from "./Mine";
import { WeaponAWP } from "./AWP";
import { WeaponType } from "./WeaponTypes";

export const WeaponCollection = {
  [WeaponType.GLOCK]: WeaponGlock,
  [WeaponType.MP5]: WeaponMP5,
  [WeaponType.GRENADE]: WeaponGrenade,
  [WeaponType.SAWED]: WeaponSawed,
  [WeaponType.MINE]: WeaponMine,
  [WeaponType.AWP]: WeaponAWP,
}

export function preloadWeapons(scene: Phaser.Scene): void {
  Object.values(WeaponCollection).forEach(WeaponClass => {
    WeaponClass.preload(scene);
  });
}

export function createWeapon(weaponType: WeaponType, scene: Phaser.Scene): WeaponEntity {
  const WeaponClass = WeaponCollection[weaponType];
  const id = generateId();
  return new WeaponClass(scene, id);
}