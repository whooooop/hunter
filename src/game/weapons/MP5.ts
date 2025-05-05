import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon } from "../core/types/weaponTypes";
import { BaseEmptyAudio } from "./assets/baseAudio";
import MP5ShootAudioUrl from './assets/audio/mp5_shoot_0.mp3';
import MP5TextureUrl from './assets/textures/mp5_texture_0.png';

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
  magazineSize: 30,    // Размер магазина

  firePointOffset: [0, -8],

   // Перезарядка
  reloadTime: 1200,    // Скорость перезарядки в мс
  boltTime: 600,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 150,       // Задержка между выстрелами в мс
  aimingTime: 2500,    // Время прицеливания в мс
  spreadAngle: 2,      // Угол разброса при выстреле в градусах
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
  },
  emptyAudio: BaseEmptyAudio,

  projectile: ProjectileName.BULLET
}
