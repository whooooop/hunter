import * as Phaser from 'phaser';
import { WeaponEntity } from '../core/entities/WeaponEntity';
import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from '../projectiles/ProjectileName';
import { WeaponOptions, WeaponTexture } from '../core/types/weaponTypes';
import { WeaponAudio } from '../core/types/weaponTypes';

import GlockFireAudioUrl from './assets/glock_fire_0.mp3';
import GlockEmptyAudioUrl from './assets/glock_empty_0.mp3';
import { GlockImageTexture_0 } from '../textures/GlockTexture';

const GlockTexture_0: WeaponTexture = {
  ...GlockImageTexture_0,
  offset: {
    x: 15,
    y: 20,
  }
}

export const GlockFireAudio: WeaponAudio = {
  key: WeaponType.GLOCK + '_fire_0',
  url: GlockFireAudioUrl,
}

export const GlockEmptyAudio: WeaponAudio = {
  key: WeaponType.GLOCK + '_empty_0',
  url: GlockEmptyAudioUrl,
}

export const GlockConfig: WeaponOptions = {
  name: WeaponType.GLOCK,
  texture: GlockTexture_0,
  reloadTime: 400,     // Скорость перезарядки в мс
  magazineSize: 30,    // Размер магазина
  damage: 18,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  fireRate: 100,       // Задержка между выстрелами в мс
  spreadAngle: 30,     // Угол разброса при выстреле в градусах
  aimingTime: 250,     // Время прицеливания в мс
  canAim: true,
  recoilForce: 0,      // Сила отдачи
  recoilRecovery: 0,   // Скорость восстановления от отдачи
  automatic: false,    // Пистолет автоматический
  fireAudio: GlockFireAudio,
  emptyAudio: GlockEmptyAudio,
  sight: true,
  shellCasings: true,

  projectile: ProjectileName.BULLET
}

export class WeaponGlock extends WeaponEntity {

  static preload(scene: Phaser.Scene): void {
    scene.load.image(GlockConfig.texture.key, GlockConfig.texture.url);
    scene.load.audio(GlockFireAudio.key, GlockFireAudio.url);
    scene.load.audio(GlockEmptyAudio.key, GlockEmptyAudio.url);
  }

  constructor(scene: Phaser.Scene, id: string) {
    super(scene, id, GlockConfig);
  }

} 