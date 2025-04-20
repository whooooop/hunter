import { hexToNumber } from '../utils/colors';
import { WeaponSightType } from '../core/entities/SightEntity';
import { WeaponType } from './WeaponTypes';
import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon, WeaponTexture } from "../core/types/weaponTypes";
import { AWPImageTexture_0 } from '../textures/AWPTexture';

const WeaponAWPTexture_0: WeaponTexture = {
  ...AWPImageTexture_0,
  offset: {
    x: 40,
    y: 20,
  }
}

export const AWPConfig: Weapon.Config = {
  name: WeaponType.AWP,
  texture: WeaponAWPTexture_0,
  reloadTime: 400,     // Скорость перезарядки в мс
  magazineSize: 8,     // Размер магазина
  damage: 1000,          // Урон от одного выстрела
  speed: [4000, 4000],    // Скорость пули
  fireRate: 5000,       // Задержка между выстрелами в мс
  canAim: true,
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи
  automatic: false,
  sight: {
    type: WeaponSightType.RAY,
    color: hexToNumber('#ff0000'),
    alpha: 0.8,
    range: 98,
    lineThickness: 2
  },
  shellCasings: true,
  firePointOffset: [0, -3],
  projectile: ProjectileName.BULLET
}
