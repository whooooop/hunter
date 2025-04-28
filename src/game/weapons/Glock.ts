import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon } from '../core/types/weaponTypes';

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
      x: 15,
      y: 20,
    }
  },

  // Патроны
  damage: 18,             // Урон от одного выстрела
  speed: [4000, 4000],    // Скорость пули
  magazineSize: 12,       // Размер магазина

  firePointOffset: [0, -7],

  // Перезарядка
  reloadTime: 400,        // Скорость перезарядки в мс
  boltTime: 600,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 300,          // Задержка между выстрелами в мс
  aimingTime: 250,        // Время прицеливания в мс
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
