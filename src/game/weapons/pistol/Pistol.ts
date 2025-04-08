import * as Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import { Player } from '../../entities/Player';
import { BaseBullet } from '../BaseBullet';
import { SimpleBullet } from './SimpleBullet';
import { createLogger } from '../../../utils/logger';

import fireSound from './assets/sounds/shot.mp3';

const logger = createLogger('Pistol');

export class Pistol extends BaseWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super('pistol', scene, player, {
      reloadTime: 400,  // Скорость перезарядки в мс
      magazineSize: 30,  // Размер магазина
      damage: 10,        // Урон от одного выстрела
      speed: 2000,        // Скорость пули
      fireRate: 100,     // Задержка между выстрелами в мс
      spreadAngle: 30,    // Угол разброса при выстреле в градусах
      aimingTime: 250,     // Время прицеливания в мс
      range: 1000,       // Дистанция стрельбы
      recoilForce: 5,    // Сила отдачи
      recoilRecovery: 5, // Скорость восстановления от отдачи
      automatic: true,  // Пистолет автоматический
      fireSoundPath: fireSound,
      bulletClass: SimpleBullet,
    });    
    
    // Инициализируем спрайт пистолета
    this.sprite = scene.add.sprite(0, 0, 'weapon_placeholder');
  }
} 