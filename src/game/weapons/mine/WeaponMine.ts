import { BaseWeapon } from "../../core/BaseWeapon";
import mineImage from './assets/mine.png';
import { ProjetileMine } from "../../projectiles/mine/ProjectileMine";
import { createTextureKey } from "../../../utils/texture";

const TEXTURE = createTextureKey('mine');

export class WeaponMine extends BaseWeapon {
    constructor(scene: Phaser.Scene) {
        super(scene, {
            name: 'Mine',
            texture: TEXTURE,
            scale: 0.5,
            offsetX: 10,
            offsetY: 10,
            reloadTime: 2000,    // Скорость перезарядки в мс
            magazineSize: 1,     // Размер магазина
            damage: 100,         // Урон от одного выстрела
            speed: [120, -20],   // Скорость пули
            fireRate: 500,       // Задержка между выстрелами в мс
            spreadAngle: 0,      // Угол разброса при выстреле в градусах
            aimingTime: 0,       // Время прицеливания в мс
            canAim: false,
            range: 100,          // Дистанция стрельбы
            recoilForce: 0,      // Сила отдачи
            recoilRecovery: 0,   // Скорость восстановления от отдачи
            automatic: false,
            sight: true,
            shellCasings: false,
            autoreload: true,
            hideWhileReload: true,
            projectile: ProjetileMine
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE, mineImage);
        ProjetileMine.preload(scene);
    }
}