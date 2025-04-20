import { WeaponType } from "./WeaponTypes";
import MP5FireAudioUrl from './assets/mp5_fire_0.mp3';
import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon, WeaponTexture } from "../core/types/weaponTypes";
import { WeaponAudio } from "../core/types/weaponTypes";
import { MP5ImageTexture_0 } from '../textures/MP5Texture';

const MP5Texture_0: WeaponTexture = {
  ...MP5ImageTexture_0,
  offset: {
    x: 20,
    y: 25,
  }
}

export const MP5FireAudio: WeaponAudio = {
  key: WeaponType.MP5 + '_fire_0',
  url: MP5FireAudioUrl,
}

export const MP5Config: Weapon.Config = {
  name: WeaponType.MP5,
  texture: MP5Texture_0,

  reloadTime: 400,     // Скорость перезарядки в мс
  magazineSize: 30,    // Размер магазина
  damage: 50,          // Урон от одного выстрела
  speed: [4000, 4000],    // Скорость пули
  fireRate: 100,       // Задержка между выстрелами в мс
  spreadAngle: 8,      // Угол разброса при выстреле в градусах
  aimingTime: 2500,    // Время прицеливания в мс
  canAim: true,
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи
  automatic: true,
  fireAudio: MP5FireAudio,
  sight: true,
  shellCasings: true,

  firePointOffset: [0, -8],
  projectile: ProjectileName.BULLET
}
