import { WeaponEntity } from "../entities/WeaponEntity";
import { Weapon } from "../types/weaponTypes";
import { WeaponType } from "./WeaponTypes";

import { StorageSpace } from "@hunter/multiplayer/dist/StorageSpace";
import { createShellCasingTexture } from "../entities/ShellCasingEntity";
import { AWPConfig } from "./AWP";
import { GlockConfig } from "./Glock";
import { GrenadeConfig } from "./Grenade";
import { LauncherConfig } from "./Launcher";
import { M4Config } from "./M4";
import { MP5Config } from "./MP5";
import { MachineConfig } from "./Machine";
import { MineConfig } from "./Mine";
import { RevolverConfig } from "./Revolver";
import { SawedConfig } from "./Sawed";

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

export function createWeapon(id: string, weaponType: WeaponType, scene: Phaser.Scene, playerId: string, storage: StorageSpace, showSight: boolean): WeaponEntity {
  const WeaponConfig = WeaponConfigs[weaponType];
  return new WeaponEntity(scene, id, WeaponConfig, playerId, storage, showSight);
}