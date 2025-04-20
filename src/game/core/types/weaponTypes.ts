import { ProjectileName } from "../../projectiles/ProjectileName";
import { SightEntityOptions } from "../entities/SightEntity";
import { ImageTexture } from "./texture";

export type WeaponTexture = ImageTexture & {
  offset: { x: number, y: number };
}

export namespace Weapon {
  export namespace Events {
    export namespace FireAction {
      export const Local = 'WeaponFireActionLocalEvent';
      export const Remote = 'WeaponFireActionRemoteEvent';
      export interface Payload {
        playerId: string;
        weaponId: string;
        originPoint: { x: number, y: number };
        targetPoint: { x: number, y: number };
        angleTilt: number;
      }
    }
  
    export namespace ReloadAction {
      export const Local = 'WeaponReloadActionLocalEvent';
      export const Remote = 'WeaponReloadActionRemoteEvent';
      export interface Payload {
        playerId: string;
        weaponId: string;
      }
    }
  
    export namespace CreateProjectile {
      export const Local = 'WeaponCreateProjectileLocalEvent';
      export const Remote = 'WeaponCreateProjectileRemoteEvent';
      export interface Payload {
        playerId: string;
        speed: number[];
        damage: number;
        weaponName: string;
        projectile: ProjectileName;
        originPoint: { x: number, y: number };
        targetPoint: { x: number, y: number };
      }
    }
  }

  export interface Config {
    name: string;
    texture: WeaponTexture;
  
    // Патроны
    damage: number;       // Урон от одного выстрела
    speed: number[];      // Скорость снаряда
  
    firePointOffset?: [number, number];
  
    // Перезарядка
    reloadTime: number; // Скорость перезарядки в мс
    magazineSize: number; // Размер магазина
  
    // Параметры стрельбы
    fireRate: number; // Задержка между выстрелами в мс
    spreadAngle?: number; // Угол разброса при выстреле в градусах
    aimingTime?: number; // Время прицеливания в секундах
    canAim: boolean; // Можно ли прицеливаться
    automatic?: boolean; // Является ли оружие автоматическим
    autoreload?: boolean; // Автоматическая перезарядка
    hideWhileReload?: boolean; // Скрывать оружие при перезарядке
  
    // Параметры отдачи
    recoilForce: number; // Сила отдачи
    recoilRecovery: number; // Скорость восстановления от отдачи
  
    emptyAudio?: WeaponAudio;
    reloadAudio?: WeaponAudio;
    afterFireAudio?: WeaponAudio;
    fireAudio?: WeaponAudio;
  
    shellCasings?: boolean;
    sight?: SightEntityOptions | boolean;
    projectile?: ProjectileName
  }
}

export interface WeaponAudio {
  key: string;
  url: string;
}

export interface FireParams {
  playerId: string;
}

export type AudioAssets = {
  fire: Phaser.Sound.BaseSound | null;
  empty: Phaser.Sound.BaseSound | null;
  reload: Phaser.Sound.BaseSound | null;
  afterFire: Phaser.Sound.BaseSound | null;
}