import { WeaponEntity } from "../core/entities/WeaponEntity";
import { WeaponType } from './WeaponTypes';
import { ProjectileName } from "../projectiles/ProjectileName";
import { WeaponOptions, WeaponTexture } from "../core/types/weaponTypes";
import { MineImageTexture_0 } from "../textures/mineTexture";

const WeaponMineTexture_0: WeaponTexture = {
  ...MineImageTexture_0,
  offset: {
    x: 20,
    y: 20,
  }
}

export const MineConfig: WeaponOptions = {
  name: WeaponType.MINE,
  texture: WeaponMineTexture_0,
  reloadTime: 2000,    // Скорость перезарядки в мс
  magazineSize: 1,     // Размер магазина
  damage: 5000,         // Урон от одного выстрела
  speed: [200, 0],   // Скорость пули
  fireRate: 500,       // Задержка между выстрелами в мс
  spreadAngle: 0,      // Угол разброса при выстреле в градусах
  aimingTime: 0,       // Время прицеливания в мс
  canAim: false,
  recoilForce: 0,      // Сила отдачи
  recoilRecovery: 0,   // Скорость восстановления от отдачи
  automatic: false,
  sight: true,
  shellCasings: false,
  autoreload: true,
  hideWhileReload: true,
  projectile: ProjectileName.MINE
}

export class WeaponMine extends WeaponEntity {

  static preload(scene: Phaser.Scene): void {
    scene.load.image(WeaponMineTexture_0.key, WeaponMineTexture_0.url);
  }

  constructor(scene: Phaser.Scene, id: string) {
    super(scene, id, MineConfig);  
  }

}