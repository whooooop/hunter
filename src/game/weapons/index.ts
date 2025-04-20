import { WeaponEntity } from "../core/entities/WeaponEntity";
import { WeaponType } from "./WeaponTypes";
import { Weapon } from "../core/types/weaponTypes";

import { GlockConfig } from "./Glock";
import { MP5Config } from "./MP5";
import { GrenadeConfig } from "./Grenade";
import { SawedConfig } from "./Sawed";
import { MineConfig } from "./Mine";
import { AWPConfig } from "./AWP";

export const WeaponConfigs: Record<WeaponType, Weapon.Config> = {
  [WeaponType.GLOCK]: GlockConfig,
  [WeaponType.MP5]: MP5Config,
  [WeaponType.GRENADE]: GrenadeConfig,
  [WeaponType.SAWED]: SawedConfig,
  [WeaponType.MINE]: MineConfig,
  [WeaponType.AWP]: AWPConfig,
}

export function preloadWeapons(scene: Phaser.Scene): void {
  Object.values(WeaponConfigs).forEach(WeaponConfig => {
    scene.load.image(WeaponConfig.texture.key, WeaponConfig.texture.url);
    if (WeaponConfig.fireAudio) {
      scene.load.audio(WeaponConfig.fireAudio.key, WeaponConfig.fireAudio.url);
    }
    if (WeaponConfig.emptyAudio) {
      scene.load.audio(WeaponConfig.emptyAudio.key, WeaponConfig.emptyAudio.url);
    }
    if (WeaponConfig.reloadAudio) {
      scene.load.audio(WeaponConfig.reloadAudio.key, WeaponConfig.reloadAudio.url);
    }
    if (WeaponConfig.afterFireAudio) {
      scene.load.audio(WeaponConfig.afterFireAudio.key, WeaponConfig.afterFireAudio.url);
    }
  });
}

export function getWeaponConfig(weaponType: WeaponType): Weapon.Config {
  return WeaponConfigs[weaponType];
}

export function createWeapon(id: string, weaponType: WeaponType, scene: Phaser.Scene): WeaponEntity {
  const WeaponConfig = WeaponConfigs[weaponType];
  return new WeaponEntity(scene, id, WeaponConfig);
}