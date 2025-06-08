import { SightEntityOptions } from "../entities/SightEntity";
import { ProjectileName } from "../projectiles/ProjectileName";
import { WeaponType } from "../weapons/WeaponTypes";
import { Audio } from "./audioTypes";
import { ImageTexture } from "./texture";

export type WeaponTexture = ImageTexture & {
  offset: { x: number, y: number };
}

export namespace Weapon {
  export namespace Events {
    export namespace CreateProjectile {
      export const Local = 'WeaponCreateProjectileLocalEvent';
      export interface Payload {
        playerId: string;
        speed: number[];
        damage: number;
        weaponName: WeaponType;
        projectile: ProjectileName;
        originPoint: { x: number, y: number };
        targetPoint: { x: number, y: number };
        velocity: { x: number, y: number };
      }
    }

    export namespace AimPoint {
      export const Local = 'WeaponAimPointLocalEvent';
      export const Remote = 'WeaponAimPointRemoteEvent';
      export interface Payload {
        playerId: string;
        targetPoint: { x: number, y: number };
      }
    }

    export namespace Reloading {
      export const Local = 'WeaponReloadingLocalEvent';
      export interface Payload {
        playerId: string;
        weaponId: string;
        progress: number;
      }
    }
  }

  export interface Config {
    name: WeaponType;
    texture: WeaponTexture;

    // Патроны
    damage: number;             // Урон от одного выстрела
    speed: number[];            // Скорость снаряда
    magazineSize: number;       // Размер магазина

    firePointOffset?:
    [number, number];

    // Перезарядка
    reloadTime: number;         // Скорость перезарядки в мс
    reloadItemTime?: number;    // Скорость перезарядки одной еденицы в мс
    boltTime?: number;          // Время взвода затвора
    // preventReload?: boolean;    // Прерывание перезарядки
    reloadByOne?: boolean;      // Перезарядка по одной пуле

    // Параметры стрельбы
    fireRate: number;           // Задержка между выстрелами в мс
    aimingTime?: number;        // Время прицеливания в секундах, время выравнивания прицела
    spreadAngle?: number;       // Угол разброса при выстреле в градусах
    automatic?: boolean;        // Является ли оружие автоматическим, для неавтоматических оружий требуется взвод затвора после каждого выстрела
    autoreload?: boolean;       // Автоматическая перезарядка

    hideWhileReload?: boolean;  // Скрывать оружие при перезарядке
    triggerRelease?: boolean;   // Освобождение триггера после каждого выстрела

    // Параметры отдачи
    recoilForce: number;        // Сила отдачи
    recoilRecovery: number;     // Скорость восстановления от отдачи

    muzzleFlash?: {
      scale: number;
    };

    emptyAudio?: Audio.Asset;
    reloadAudio?: Audio.Asset;
    reloadItemAudio?: Audio.Asset;
    boltAudio?: Audio.Asset;
    fireAudio?: Audio.Asset;

    shellCasings?: boolean;
    sight?: SightEntityOptions | boolean;
    hideSightWhenCantFire?: boolean;

    projectile?: ProjectileName;
  }
}

export interface FireParams {
  playerId: string;
}

export type AudioAssets = {
  fire: Phaser.Sound.BaseSound | null;
  empty: Phaser.Sound.BaseSound | null;
  reload: Phaser.Sound.BaseSound | null;
  reloadItem: Phaser.Sound.BaseSound | null;
  bolt: Phaser.Sound.BaseSound | null;
}