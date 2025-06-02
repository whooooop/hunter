import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon } from '../types/weaponTypes';
import { WeaponType } from "./WeaponTypes";

import { BaseBoltAudio, BaseEmptyAudio } from "./assets/baseAudio";

import GlockShootAudioUrl from './assets/audio/glock_shoot_audio_0.mp3';
import GlockTextureUrl from './assets/textures/glock_texture_0.png';

const GlockShootAudio: Weapon.Audio.Asset = {
  key: WeaponType.GLOCK + '_shoot_0',
  url: GlockShootAudioUrl,
}

export const GlockConfig: Weapon.Config = {
  name: WeaponType.GLOCK,
  texture: {
    key: 'weapon_glock_texture_0',
    url: GlockTextureUrl,
    scale: 0.5,
    offset: {
      x: 13,
      y: 24,
    }
  },

  // Патроны
  damage: 18,             // Урон от одного выстрела
  speed: [4000, 4000],    // Скорость пули
  magazineSize: 15,       // Размер магазина

  firePointOffset: [0, -7],

  // Перезарядка
  reloadTime: 900,        // Скорость перезарядки в мс
  boltTime: 400,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 180,          // Задержка между выстрелами в мс
  aimingTime: 200,        // Время прицеливания в мс
  spreadAngle: 5,        // Угол разброса при выстреле в градусах
  automatic: true,        // Пистолет автоматический
  autoreload: false,      // Автоматическая перезарядка

  triggerRelease: true,

  // Параметры отдачи
  recoilForce: 0,      // Сила отдачи
  recoilRecovery: 0,   // Скорость восстановления от отдачи

  sight: true,
  shellCasings: true,

  muzzleFlash: {
    scale: 0.3,
  },

  fireAudio: GlockShootAudio,
  emptyAudio: BaseEmptyAudio,
  boltAudio: BaseBoltAudio,

  projectile: ProjectileName.BULLET
}
