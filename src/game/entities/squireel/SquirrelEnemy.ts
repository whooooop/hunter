import * as Phaser from 'phaser';
import { BaseEnemy } from '../../core/BaseEnemy';
import { DecalManager } from '../../core/DecalManager';
import enemyPlaceholder from './assets/images/enemy_placeholder.png';
import { generateStringWithLength } from '../../../utils/stringGenerator';

const TEXTURE_SQUIRREL = 'squirrel' + generateStringWithLength(6);

interface SquirrelEnemyOptions {
  moveX: number;
  moveY: number;
  direction: number;
  health: number;
  decalManager?: DecalManager;
}

export class SquirrelEnemy extends BaseEnemy {
  constructor(scene: Phaser.Scene, x: number, y: number, options: SquirrelEnemyOptions) {
    super(scene, x, y, {
      name: 'Squirrel',
      health: options.health,
      acceleration: 10,
      deceleration: 8,
      maxVelocityX: 100,
      maxVelocityY: 2,
      direction: -1,
      friction: 0,
      moveX: -1,
      moveY: 1,
      scale: 0.7,
      decalManager: options.decalManager
    });
    
    // Дополнительная настройка для белки
    this.setupSquirrel();
  }
  
  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_SQUIRREL, enemyPlaceholder);
  }

  private setupSquirrel(): void {
    // Масштабируем спрайт, так как белка маленькая
    this.sprite.setScale(0.7);
    
    // Настраиваем физику для белки
    this.sprite.body?.setSize(
      this.sprite.width * 0.8, 
      this.sprite.height * 0.8
    );
  }
  
  public update(time: number, delta: number): void {
    // Добавляем случайные прыжки для белки
    // if (Math.random() < 0.01) {
    //   this.sprite.setVelocityY(-200);
    // }

    super.update(time, delta);
  }
} 