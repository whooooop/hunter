import { ProjectileName } from "../projectiles/ProjectileName";
import { MineImageTexture_0 } from "../textures/mineTexture";
import { Weapon, WeaponTexture } from "../types/weaponTypes";
import { WeaponType } from './WeaponTypes';

const WeaponMineTexture_0: WeaponTexture = {
  ...MineImageTexture_0,
  offset: {
    x: 20,
    y: 26,
  }
}

export const MineConfig: Weapon.Config = {
  name: WeaponType.MINE,
  texture: WeaponMineTexture_0,
  reloadTime: 2200,    // Скорость перезарядки в мс
  magazineSize: 1,     // Размер магазина
  damage: 300,         // Урон от одного выстрела
  speed: [200, 0],   // Скорость пули
  fireRate: 500,       // Задержка между выстрелами в мс
  spreadAngle: 0,      // Угол разброса при выстреле в градусах
  aimingTime: 0,       // Время прицеливания в мс
  recoilForce: 0,      // Сила отдачи
  recoilRecovery: 0,   // Скорость восстановления от отдачи
  automatic: false,
  sight: true,
  shellCasings: false,
  autoreload: true,
  hideWhileReload: true,
  projectile: ProjectileName.MINE
}
