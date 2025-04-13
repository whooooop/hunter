import { Bullet } from '../../projectiles/bullet/Bullet';
import { WeaponEntity } from "../../core/entities/WeaponEntity";
import { AWP_TEXTURE } from './assets';
import { hexToNumber } from '../../utils/colors';
import { WeaponSightType } from '../../core/BaseWeaponSight';

export class WeaponAWP extends WeaponEntity {
    name: string = 'AWP';

    constructor(scene: Phaser.Scene) {
        super(scene, {
            texture: AWP_TEXTURE.key,
            scale: 0.5,
            offsetX: 40,
            offsetY: 20,
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
            projectile: Bullet
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(AWP_TEXTURE.key, AWP_TEXTURE.url);
    }
}