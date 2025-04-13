import * as Phaser from 'phaser';
import { generateStringWithLength } from '../../../utils/stringGenerator';
import { EnemyEntity } from '../../core/entities/EnemyEntity';

import squirrelImage from './assets/images/squirrel.png';

const TEXTURE_SQUIRREL = 'squirrel' + generateStringWithLength(6);

interface SquirrelEnemyOptions {
  moveX: number;
  moveY: number;
  direction: number;
  health: number;
}

export class SquirrelEnemy extends EnemyEntity {
  name: string = 'Squirrel';

  constructor(scene: Phaser.Scene, x: number, y: number, options: SquirrelEnemyOptions) {
    const gameObject = scene.physics.add.sprite(x, y, TEXTURE_SQUIRREL);

    super(scene, gameObject,x, y, {
      health: options.health,
      acceleration: 10,
      deceleration: 8,
      maxVelocityX: 50,
      maxVelocityY: 2,
      direction: -1,
      friction: 0,
    });
    
    this.motionController.setMove(-1, 1);
    // Дополнительная настройка для белки
    this.setupSquirrel();
  }
  
  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_SQUIRREL, squirrelImage);
  }

  private setupSquirrel(): void {
    this.gameObject.setScale(0.5);
  }
} 