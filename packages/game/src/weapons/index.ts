import { WeaponEntity } from "../entities/WeaponEntity";
import { Weapon } from "../types/weaponTypes";
import { WeaponType } from "./WeaponTypes";

import { StorageSpace } from "@hunter/multiplayer/dist/StorageSpace";
import { preloadMissSound } from "../audio/miss";
import { createShellCasingTexture } from "../entities/ShellCasingEntity";
import { AudioService } from "../services/AudioService";
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
  preloadMissSound(scene);

  Object.values(WeaponConfigs).forEach(WeaponConfig => {
    if (WeaponConfig.texture.url) {
      scene.load.image(WeaponConfig.texture.key, WeaponConfig.texture.url);
    }
    if (WeaponConfig.fireAudio) {
      AudioService.preloadAsset(scene, WeaponConfig.fireAudio);
    }
    if (WeaponConfig.emptyAudio) {
      AudioService.preloadAsset(scene, WeaponConfig.emptyAudio);
    }
    if (WeaponConfig.reloadAudio) {
      AudioService.preloadAsset(scene, WeaponConfig.reloadAudio);
    }
    if (WeaponConfig.boltAudio) {
      AudioService.preloadAsset(scene, WeaponConfig.boltAudio);
    }
    if (WeaponConfig.reloadItemAudio) {
      AudioService.preloadAsset(scene, WeaponConfig.reloadItemAudio);
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