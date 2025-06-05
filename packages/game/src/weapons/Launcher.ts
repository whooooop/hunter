import { ProjectileName } from '../projectiles/ProjectileName';
import { Audio, Weapon } from '../types';
import { WeaponType } from "./WeaponTypes";

import LauncherShootAudioUrl from './assets/audio/launcher_shoot_audio_0.mp3';
import { BaseBoltAudio, BaseEmptyAudio } from "./assets/baseAudio";
import LauncherTextureUrl from './assets/textures/launcher_texture_0.png';

export const LauncherConfig: Weapon.Config = {
  name: WeaponType.LAUNCHER,
  texture: {
    key: 'launcher_texture_0',
    url: LauncherTextureUrl,
    scale: 0.5,
    offset: {
      x: 22,
      y: 20,
    }
  },

  firePointOffset: [0, -8],

  damage: 250,           // Урон от одного выстрела
  speed: [1200, 100],     // Скорость пули
  magazineSize: 6,      // Размер магазина

  // Перезарядка
  reloadTime: 1000,     // Скорость перезарядки
  boltTime: 250,        // Время взвода затвора
  reloadByOne: true,    // Перезарядка по одной пуле
  reloadItemTime: 350,  // Скорость перезарядки одной еденицы в мс

  // Параметры стрельбы
  fireRate: 200,       // Задержка между выстрелами в мс
  aimingTime: 250,      // Время прицеливания в мс
  spreadAngle: 10,      // Угол разброса при выстреле в градусах
  automatic: false,

  // Параметры отдачи
  recoilForce: 3,      // Сила отдачи
  recoilRecovery: 5,    // Скорость восстановления от отдачи

  fireAudio: {
    key: WeaponType.LAUNCHER + '_shoot_0',
    url: LauncherShootAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
  emptyAudio: BaseEmptyAudio,
  boltAudio: BaseBoltAudio,

  sight: true,
  shellCasings: true,
  triggerRelease: true, // Освобождение триггера после каждого выстрела

  projectile: ProjectileName.PROJECTILE
}
