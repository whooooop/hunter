import { generateStringWithLength } from "../../../utils/stringGenerator";
import grenadeImage from './assets/grenade.png';
import { ProjetileGrenage } from "../../projectiles/granade/ProjetileGrenage";
import { WeaponEntity } from "../../core/entities/WeaponEntity";
import { ExplosionEntity } from "../../core/entities/ExplosionEntity";

const TEXTURE = 'grenade_texture_' + generateStringWithLength(6);

export class Grenade extends WeaponEntity {
    constructor(scene: Phaser.Scene) {
        super(scene, {
            name: 'Grenade',
            texture: TEXTURE,
            scale: 0.5,
            offsetX: 10,
            offsetY: 10,
            reloadTime: 2000,    // Скорость перезарядки в мс
            magazineSize: 1,     // Размер магазина
            damage: 1000,         // Урон от одного выстрела
            speed: [900, 100],   // Скорость пули
            fireRate: 500,       // Задержка между выстрелами в мс
            spreadAngle: 0,      // Угол разброса при выстреле в градусах
            aimingTime: 0,       // Время прицеливания в мс
            canAim: false,
            recoilForce: 0,      // Сила отдачи
            recoilRecovery: 5,   // Скорость восстановления от отдачи
            automatic: false,
            sight: true,
            shellCasings: false,
            autoreload: true,
            hideWhileReload: true,
            
            projectile: ProjetileGrenage
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE, grenadeImage);
        ProjetileGrenage.preload(scene);
        ExplosionEntity.preload(scene);
    }
}