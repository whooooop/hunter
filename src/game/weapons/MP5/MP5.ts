import { Bullet } from '../../projectiles/bullet/Bullet';
import { generateStringWithLength } from "../../../utils/stringGenerator";
import { BaseWeapon } from "../../core/BaseWeapon";
import mp5Image from './mp5.png';
import fireSound from './shot.mp3';

const TEXTURE = 'mp5_texture_' + generateStringWithLength(6);
const AUDIO_FIRE = 'mp5_fire_' + generateStringWithLength(6);

export class MP5 extends BaseWeapon {
    constructor(scene: Phaser.Scene) {
        super(scene, {
            name: 'MP5',
            texture: TEXTURE,
            scale: 0.5,
            offsetX: 10,
            offsetY: 10,
            reloadTime: 400,     // Скорость перезарядки в мс
            magazineSize: 30,    // Размер магазина
            damage: 10,          // Урон от одного выстрела
            speed: [4000, 0],         // Скорость пули
            fireRate: 100,       // Задержка между выстрелами в мс
            spreadAngle: 1,     // Угол разброса при выстреле в градусах
            aimingTime: 250,     // Время прицеливания в мс
            canAim: true,
            range: 1000,         // Дистанция стрельбы
            recoilForce: 2,      // Сила отдачи
            recoilRecovery: 5,   // Скорость восстановления от отдачи
            automatic: true,
            fireAudio: AUDIO_FIRE,
            sight: true,
            shellCasings: true,

            projectile: Bullet
          });  
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE, mp5Image);
        scene.load.audio(AUDIO_FIRE, fireSound);
    }
}