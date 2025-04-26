import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon } from "../core/types/weaponTypes";
import { BaseEmptyAudio } from "./assets/baseAudio";
import M4TextureUrl from './assets/textures/m4_texture_0.png';
import M4ShootAudioUrl from './assets/audio/m4_shoot_audio_0.mp3';
import M4BoltAudioUrl from './assets/audio/m4_bolt_audio_0.mp3';
import M4ReloadAudioUrl from './assets/audio/m4_reload_audio_0.mp3';

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
  magazineSize: 30,    // Размер магазина

  firePointOffset: [0, -8],

   // Перезарядка
  reloadTime: 2000,    // Скорость перезарядки в мс
  boltTime: 1000,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 100,       // Задержка между выстрелами в мс
  aimingTime: 2500,    // Время прицеливания в мс
  spreadAngle: 2,      // Угол разброса при выстреле в градусах
  automatic: true,

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
