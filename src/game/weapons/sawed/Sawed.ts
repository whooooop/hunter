import * as Phaser from 'phaser';
import { BaseWeapon } from '../../core/BaseWeapon';
import { generateStringWithLength } from '../../../utils/stringGenerator';

import sawedImage from './assets/sawed.png';
import { hexToNumber } from '../../utils/colors';

const TEXTURE = 'sawed_texture_' + generateStringWithLength(6);

export class Sawed extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      name: 'Sawed',
      texture: TEXTURE,
      scale: 0.5,
      offsetX: 35,
      offsetY: 0,
      reloadTime: 400,     // Скорость перезарядки в мс
      magazineSize: 30,    // Размер магазина
      damage: 50,          // Урон от одного выстрела
      speed: 4000,         // Скорость пули
      fireRate: 100,       // Задержка между выстрелами в мс
      spreadAngle: 10,      // Угол разброса при выстреле в градусах
      aimingTime: 250,     // Время прицеливания в мс
      canAim: false,
      range: 1000,         // Дистанция стрельбы
      recoilForce: 2,      // Сила отдачи
      recoilRecovery: 5,   // Скорость восстановления от отдачи
      automatic: false,
      bulletCount: 30,
      bullet: {
        color: hexToNumber('#b7f191'),
        width: 10,
        height: 2,
      },
      sight: true,
      shellCasings: true,
    });    
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE, sawedImage);
  }
} 