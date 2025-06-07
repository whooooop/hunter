import { ProjectileName } from '../projectiles/ProjectileName';
import { Audio, Weapon } from '../types';
import { WeaponType } from "./WeaponTypes";

import SawedTextureUrl from './assets/textures/sawed_texture_0.png';

import SawedShootAudioUrl from './assets/audio/sawed_shoot_audio_0.mp3';
import { BaseBoltAudio2, BaseEmptyAudio, BaseReloadItemAudio, BaseReloadStartAudio } from "./assets/baseAudio";

export const SawedConfig: Weapon.Config = {
  name: WeaponType.SAWED,
  texture: {
    key: 'sawed_texture_0',
    url: SawedTextureUrl,
    scale: 0.5,
    offset: {
      x: 15,
      y: 22,
    }
  },

  firePointOffset: [0, -8],

  damage: 30,           // Урон от одного выстрела
  speed: [4000, 4000],     // Скорость пули
  magazineSize: 6,      // Размер магазина

  // Перезарядка
  reloadTime: 1000,     // Скорость перезарядки
  boltTime: 400,        // Время взвода затвора
  reloadByOne: true,    // Перезарядка по одной пуле
  reloadItemTime: 300,  // Скорость перезарядки одной еденицы в мс

  // Параметры стрельбы
  fireRate: 400,       // Задержка между выстрелами в мс
  aimingTime: 250,      // Время прицеливания в мс
  spreadAngle: 10,      // Угол разброса при выстреле в градусах
  automatic: false,

  // Параметры отдачи
  recoilForce: 30,      // Сила отдачи
  recoilRecovery: 5,    // Скорость восстановления от отдачи

  fireAudio: {
    key: WeaponType.SAWED + '_shoot_0',
    url: SawedShootAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
  emptyAudio: BaseEmptyAudio,
  reloadAudio: BaseReloadStartAudio,
  reloadItemAudio: BaseReloadItemAudio,
  boltAudio: BaseBoltAudio2,

  muzzleFlash: {
    scale: 0.8,
  },

  sight: true,
  shellCasings: true,
  triggerRelease: true, // Освобождение триггера после каждого выстрела

  projectile: ProjectileName.PELLETS
}
