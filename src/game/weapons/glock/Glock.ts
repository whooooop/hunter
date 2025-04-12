import * as Phaser from 'phaser';
import { BaseWeapon } from '../../core/BaseWeapon';
import { generateStringWithLength } from '../../../utils/stringGenerator';

import glockImage from './assets/glock.png';
import fireSound from './assets/shot.mp3';
import emptySound from './assets/empty.mp3';
import { Bullet } from '../../projectiles/bullet/Bullet';

const TEXTURE = 'glock_texture_' + generateStringWithLength(6);
const AUDIO_FIRE = 'glock_fire_' + generateStringWithLength(6);
const AUDIO_EMPTY = 'glock_empty_' + generateStringWithLength(6);

export class Glock extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      name: 'Glock',
      texture: TEXTURE,
      scale: 0.5,
      offsetX: 35,
      offsetY: 0,
      reloadTime: 400,     // Скорость перезарядки в мс
      magazineSize: 30,    // Размер магазина
      damage: 10,          // Урон от одного выстрела
      speed: 4000,         // Скорость пули
      fireRate: 100,       // Задержка между выстрелами в мс
      spreadAngle: 30,     // Угол разброса при выстреле в градусах
      aimingTime: 250,     // Время прицеливания в мс
      canAim: true,
      range: 1000,         // Дистанция стрельбы
      recoilForce: 2,      // Сила отдачи
      recoilRecovery: 5,   // Скорость восстановления от отдачи
      automatic: true,     // Пистолет автоматический
      fireAudio: AUDIO_FIRE,
      emptyAudio: AUDIO_EMPTY,
      sight: true,
      shellCasings: true,

      projectile: Bullet
    });    
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE, glockImage);
    scene.load.audio(AUDIO_FIRE, fireSound);
    scene.load.audio(AUDIO_EMPTY, emptySound);
  }
} 