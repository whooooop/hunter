import { Bullet } from '../../projectiles/bullet/Bullet';
import { WeaponEntity } from "../../core/entities/WeaponEntity";
import { MP5_AUDIO_FIRE, MP5_TEXTURE } from './assets';

export class MP5 extends WeaponEntity {
    name: string = 'MP5';

    constructor(scene: Phaser.Scene) {
        super(scene, {
            texture: MP5_TEXTURE.key,
            scale: 0.5,
            offsetX: 20,
            offsetY: 25,
            reloadTime: 400,     // Скорость перезарядки в мс
            magazineSize: 30,    // Размер магазина
            damage: 10,          // Урон от одного выстрела
            speed: [4000, 4000],    // Скорость пули
            fireRate: 100,       // Задержка между выстрелами в мс
            spreadAngle: 8,      // Угол разброса при выстреле в градусах
            aimingTime: 2500,    // Время прицеливания в мс
            canAim: true,
            recoilForce: 1,      // Сила отдачи
            recoilRecovery: 5,   // Скорость восстановления от отдачи
            automatic: true,
            fireAudio: MP5_AUDIO_FIRE.key,
            sight: true,
            shellCasings: true,

            firePointOffset: [0, -8],
            projectile: Bullet
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(MP5_TEXTURE.key, MP5_TEXTURE.url);
        scene.load.audio(MP5_AUDIO_FIRE.key, MP5_AUDIO_FIRE.url);
    }
}