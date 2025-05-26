import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon } from '../types/weaponTypes';

import { BaseEmptyAudio } from "./assets/baseAudio";

import RevolverShootAudioUrl from './assets/audio/revolver_shoot_audio_0.mp3';
import RevolverBoltAudioUrl from './assets/audio/revolver_bolt_audio_0.mp3';
import RevolverTextureUrl from './assets/textures/revolver_texture_0.png';

export const RevolverConfig: Weapon.Config = {
  name: WeaponType.REVOLVER,
  texture: {
    key: WeaponType.REVOLVER + '_texture_0',
    url: RevolverTextureUrl,
    scale: 0.5,
    offset: {
      x: 16,
      y: 22,
    }
  },

  damage: 60,             // Урон от одного выстрела
  speed: [4000, 4000],    // Скорость пули
  magazineSize: 6,        // Размер магазина

  firePointOffset: [0, -9],

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
    scale: 0.5,
  },

  fireAudio: {
    key: WeaponType.REVOLVER + '_shoot_0',
    url: RevolverShootAudioUrl,
  },
  emptyAudio: BaseEmptyAudio,
  boltAudio: {
    key: WeaponType.REVOLVER + '_bolt_0',
    url: RevolverBoltAudioUrl,
  },

  projectile: ProjectileName.BULLET
}
