import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon } from "../types/weaponTypes";
import M4BoltAudioUrl from './assets/audio/m4_bolt_audio_0.mp3';
import M4ReloadAudioUrl from './assets/audio/m4_reload_audio_0.mp3';
import M4ShootAudioUrl from './assets/audio/m4_shoot_audio_0.mp3';
import { BaseEmptyAudio } from "./assets/baseAudio";
import M4TextureUrl from './assets/textures/m4_texture_0.png';
import { WeaponType } from "./WeaponTypes";

export const M4Config: Weapon.Config = {
  name: WeaponType.M4,
  texture: {
    key: 'm4_texture_0',
    url: M4TextureUrl,
    scale: 0.5,
    offset: {
      x: 20,
      y: 25,
    }
  },

  damage: 50,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  magazineSize: 32,    // Размер магазина

  firePointOffset: [0, -8],

  // Перезарядка
  reloadTime: 2000,    // Скорость перезарядки в мс
  boltTime: 500,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 110,       // Задержка между выстрелами в мс
  aimingTime: 200,    // Время прицеливания в мс
  spreadAngle: 2,      // Угол разброса при выстреле в градусах
  automatic: true,

  muzzleFlash: {
    scale: 0.8,
  },

  // Параметры отдачи
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи

  sight: true,
  shellCasings: true,

  fireAudio: {
    key: WeaponType.M4 + '_shoot_0',
    url: M4ShootAudioUrl,
  },
  boltAudio: {
    key: WeaponType.M4 + '_bolt_0',
    url: M4BoltAudioUrl,
  },
  reloadAudio: {
    key: WeaponType.M4 + '_reload_0',
    url: M4ReloadAudioUrl,
  },
  emptyAudio: BaseEmptyAudio,

  projectile: ProjectileName.BULLET
}
