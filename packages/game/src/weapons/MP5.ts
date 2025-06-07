import { ProjectileName } from "../projectiles/ProjectileName";
import { Audio, Weapon } from "../types";
import MP5ShootAudioUrl from './assets/audio/mp5_shoot_0.mp3';
import { BaseBoltAudio3, BaseEmptyAudio, BaseReloadAudio } from "./assets/baseAudio";
import MP5TextureUrl from './assets/textures/mp5_texture_0.png';
import { WeaponType } from "./WeaponTypes";

export const MP5Config: Weapon.Config = {
  name: WeaponType.MP5,
  texture: {
    key: 'mp5_texture_0',
    url: MP5TextureUrl,
    scale: 0.5,
    offset: {
      x: 14,
      y: 23,
    }
  },

  damage: 40,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  magazineSize: 32,    // Размер магазина

  firePointOffset: [0, -8],

  // Перезарядка
  reloadTime: 1600,    // Скорость перезарядки в мс
  boltTime: 500,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 120,       // Задержка между выстрелами в мс
  aimingTime: 2500,    // Время прицеливания в мс
  spreadAngle: 3,      // Угол разброса при выстреле в градусах
  automatic: true,

  // Параметры отдачи
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи

  sight: true,
  shellCasings: true,

  muzzleFlash: {
    scale: 0.5,
  },

  fireAudio: {
    key: WeaponType.MP5 + '_shoot_0',
    url: MP5ShootAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
  emptyAudio: BaseEmptyAudio,
  reloadAudio: BaseReloadAudio,
  boltAudio: BaseBoltAudio3,

  projectile: ProjectileName.BULLET
}
