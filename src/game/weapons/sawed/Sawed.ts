import * as Phaser from 'phaser';
import { BaseWeapon } from '../../core/BaseWeapon';
import { generateStringWithLength } from '../../../utils/stringGenerator';
import { Bullet } from '../../projectiles/bullet/Bullet';

import sawedImage from './assets/sawed.png';
import sawedFireAudio from './assets/fire.mp3';
import sawedEmptyAudio from './assets/empty.mp3';
import sawedReloadAudio from './assets/reload.mp3';
import sawedAfterFireAudio from './assets/after_fire.mp3';

const TEXTURE = 'sawed_texture_' + generateStringWithLength(6);
const FIRE_AUDIO = 'sawed_fire' + generateStringWithLength(6);
const EMPTY_AUDIO = 'sawed_empty' + generateStringWithLength(6);
const RELOAD_AUDIO = 'sawed_reload' + generateStringWithLength(6);
const AFTER_FIRE_AUDIO = 'sawed_after_fire' + generateStringWithLength(6);

export class Sawed extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    super(scene, {
      name: 'Sawed',
      texture: TEXTURE,
      scale: 0.5,
      offsetX: 35,
      offsetY: 0,
      reloadTime: 5000,     // Скорость перезарядки в мс
      magazineSize: 6,    // Размер магазина
      damage: 50,          // Урон от одного выстрела
      speed: 4000,         // Скорость пули
      fireRate: 1300,       // Задержка между выстрелами в мс
      spreadAngle: 10,      // Угол разброса при выстреле в градусах
      aimingTime: 250,     // Время прицеливания в мс
      canAim: false,
      range: 1000,         // Дистанция стрельбы
      recoilForce: 30,      // Сила отдачи
      recoilRecovery: 5,   // Скорость восстановления от отдачи
      automatic: false,
      fireAudio: FIRE_AUDIO,
      emptyAudio: EMPTY_AUDIO,
      reloadAudio: RELOAD_AUDIO,
      afterFireAudio: AFTER_FIRE_AUDIO,
      sight: true,
      shellCasings: true,
      
      projectile: Bullet
    });    
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE, sawedImage);
    scene.load.audio(FIRE_AUDIO, sawedFireAudio);
    scene.load.audio(EMPTY_AUDIO, sawedEmptyAudio);
    scene.load.audio(RELOAD_AUDIO, sawedReloadAudio);
    scene.load.audio(AFTER_FIRE_AUDIO, sawedAfterFireAudio);
  }
} 