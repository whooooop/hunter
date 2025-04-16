import * as Phaser from 'phaser';
import { generateStringWithLength } from '../../../utils/stringGenerator';
import { EnemyEntity } from '../../core/entities/EnemyEntity';
import { ScoreKill } from '../../../types/score';
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

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_SQUIRREL, squirrelImage);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, options: SquirrelEnemyOptions) {
    const gameObject = scene.physics.add.sprite(x, y, TEXTURE_SQUIRREL);

    super(scene, id, gameObject, x, y, {
      health: options.health,
      acceleration: 10,
      deceleration: 8,
      maxVelocityX: 50,
      maxVelocityY: 2,
      direction: -1,
      friction: 0,
      score: {
        value: 100,
      },
      debug: true,
    });
    
    this.motionController.setMove(-1, 1);
    this.gameObject.setScale(0.5);
  }
  
  protected getHeadBounds(): [number, number, number, number] {
    const [HeadX, HeadY, HeadWidth, HeadHeight] = super.getHeadBounds();
    return [HeadX, HeadY, HeadWidth / 2, HeadHeight - 18];
  }
} 