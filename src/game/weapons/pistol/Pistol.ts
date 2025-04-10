import * as Phaser from 'phaser';
import { BaseWeapon } from '../../core/BaseWeapon';
import { SimpleBullet } from './SimpleBullet';

import fireSound from './assets/sounds/shot.mp3';
import emptySound from './assets/sounds/empty.mp3';

export class Pistol extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    super('pistol', scene, {
      reloadTime: 400,     // Скорость перезарядки в мс
      magazineSize: 30,    // Размер магазина
      damage: 10,          // Урон от одного выстрела
      speed: 4000,         // Скорость пули
      fireRate: 100,       // Задержка между выстрелами в мс
      spreadAngle: 1,     // Угол разброса при выстреле в градусах
      aimingTime: 250,     // Время прицеливания в мс
      range: 1000,         // Дистанция стрельбы
      recoilForce: 2,      // Сила отдачи
      recoilRecovery: 5,   // Скорость восстановления от отдачи
      automatic: true,     // Пистолет автоматический
      fireSoundPath: fireSound,
      bulletClass: SimpleBullet,
      emptySoundPath: emptySound,
    });    
    
    // Инициализируем спрайт пистолета
    this.sprite = scene.add.sprite(0, 0, 'weapon_placeholder');
  }
} 