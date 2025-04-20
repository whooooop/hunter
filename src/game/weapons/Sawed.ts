import * as Phaser from 'phaser';
import { WeaponType } from "./WeaponTypes";
import { WeaponEntity } from '../core/entities/WeaponEntity';
import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon, WeaponAudio, WeaponTexture } from '../core/types/weaponTypes';

import SawedFireAudioUrl from './assets/sawed_fire_0.mp3';
import SawedEmptyAudioUrl from './assets/sawed_empty_0.mp3';
import SawedReloadAudioUrl from './assets/sawed_reload_0.mp3';
import SawedAfterFireAudioUrl from './assets/sawed_after_fire_0.mp3';
import { SawedImageTexture_0 } from '../textures/SawedTexture';

const SawedTexture_0: WeaponTexture = {
  ...SawedImageTexture_0,
  offset: {
    x: 35,
    y: 0,
  }
}

export const SawedFireAudio: WeaponAudio = {
  key: WeaponType.SAWED + '_fire_0',
  url: SawedFireAudioUrl,
}

export const SawedEmptyAudio: WeaponAudio = {
  key: WeaponType.SAWED + '_empty_0',
  url: SawedEmptyAudioUrl,
}

export const SawedReloadAudio: WeaponAudio = {
  key: WeaponType.SAWED + '_reload_0',
  url: SawedReloadAudioUrl,
} 

export const SawedAfterFireAudio: WeaponAudio = {
  key: WeaponType.SAWED + '_after_fire_0',
  url: SawedAfterFireAudioUrl,
}

export const SawedConfig: Weapon.Config = {
  name: WeaponType.SAWED,
  texture: SawedTexture_0,
  reloadTime: 5000,     // Скорость перезарядки в мс
  magazineSize: 6,    // Размер магазина
  damage: 50,          // Урон от одного выстрела
  speed: [4000, 0],         // Скорость пули
  fireRate: 1300,       // Задержка между выстрелами в мс
  spreadAngle: 10,      // Угол разброса при выстреле в градусах
  aimingTime: 250,     // Время прицеливания в мс
  canAim: false,
  recoilForce: 30,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи
  automatic: false,
  fireAudio: SawedFireAudio,
  emptyAudio: SawedEmptyAudio,
  reloadAudio: SawedReloadAudio,
  afterFireAudio: SawedAfterFireAudio,
  sight: true,
  shellCasings: true,
  
  projectile: ProjectileName.BULLET
}
