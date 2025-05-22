import { WeaponEntity } from "../entities/WeaponEntity";
import { WeaponType } from "./WeaponTypes";
import { Weapon } from "../types/weaponTypes";

import { GlockConfig } from "./Glock";
import { MP5Config } from "./MP5";
import { MachineConfig } from "./Machine";
import { GrenadeConfig } from "./Grenade";
import { SawedConfig } from "./Sawed";
import { MineConfig } from "./Mine";
import { AWPConfig } from "./AWP";
import { RevolverConfig } from "./Revolver";
import { M4Config } from "./M4";
import { LauncherConfig } from "./Launcher";
import { createShellCasingTexture } from "../entities/ShellCasingEntity";

export const WeaponConfigs: Record<WeaponType, Weapon.Config> = {
  [WeaponType.GLOCK]: GlockConfig,
  [WeaponType.REVOLVER]: RevolverConfig,
  [WeaponType.MP5]: MP5Config,
  [WeaponType.MACHINE]: MachineConfig,
  [WeaponType.M4]: M4Config,
  [WeaponType.GRENADE]: GrenadeConfig,
  [WeaponType.SAWED]: SawedConfig,
  [WeaponType.MINE]: MineConfig,
  [WeaponType.AWP]: AWPConfig,
  [WeaponType.LAUNCHER]: LauncherConfig,
}

export function preloadWeapons(scene: Phaser.Scene): void {
  createShellCasingTexture(scene);
  
  Object.values(WeaponConfigs).forEach(WeaponConfig => {
    if (WeaponConfig.texture.url) {
      scene.load.image(WeaponConfig.texture.key, WeaponConfig.texture.url);
    }
    if (WeaponConfig.fireAudio) {
      scene.load.audio(WeaponConfig.fireAudio.key, WeaponConfig.fireAudio.url);
    }
    if (WeaponConfig.emptyAudio) {
      scene.load.audio(WeaponConfig.emptyAudio.key, WeaponConfig.emptyAudio.url);
    }
    if (WeaponConfig.reloadAudio) {
      scene.load.audio(WeaponConfig.reloadAudio.key, WeaponConfig.reloadAudio.url);
    }
    if (WeaponConfig.boltAudio) {
      scene.load.audio(WeaponConfig.boltAudio.key, WeaponConfig.boltAudio.url);
    }
    if (WeaponConfig.reloadItemAudio) {
      scene.load.audio(WeaponConfig.reloadItemAudio.key, WeaponConfig.reloadItemAudio.url);
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