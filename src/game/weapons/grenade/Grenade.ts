import { BaseWeapon } from "../../core/BaseWeapon";
import { generateStringWithLength } from "../../../utils/stringGenerator";
import grenadeImage from './assets/grenade.png';
import { ProjetileGrenage } from "../../projectiles/granade/ProjetileGrenage";

const TEXTURE = 'grenade_texture_' + generateStringWithLength(6);

export class Grenade extends BaseWeapon {
    constructor(scene: Phaser.Scene) {
        super(scene, {
            name: 'Grenade',
            texture: TEXTURE,
            scale: 0.5,
            offsetX: 10,
            offsetY: 10,
            reloadTime: 400,     // Скорость перезарядки в мс
            magazineSize: 1,     // Размер магазина
            damage: 100,         // Урон от одного выстрела
            speed: 900,          // Скорость пули
            fireRate: 500,       // Задержка между выстрелами в мс
            spreadAngle: 0,      // Угол разброса при выстреле в градусах
            aimingTime: 0,       // Время прицеливания в мс
            canAim: false,
            range: 100,          // Дистанция стрельбы
            recoilForce: 0,      // Сила отдачи
            recoilRecovery: 5,   // Скорость восстановления от отдачи
            automatic: false,
            sight: true,
            shellCasings: false,

            projectile: ProjetileGrenage
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE, grenadeImage);
        ProjetileGrenage.preload(scene);
    }
}