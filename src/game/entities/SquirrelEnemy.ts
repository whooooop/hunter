import * as Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType } from '../core/Constants';

export class SquirrelEnemy extends BaseEnemy {
  name = 'Squirrel';
  type = EnemyType.SQUIRREL;

  moveX: number = -1;
  moveY: number = 1;
  direction: number = -1;
  maxVelocityX: number = 20;
  maxVelocityY: number = 2;
  acceleration: number = 10;
  deceleration: number = 8;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Дополнительная настройка для белки
    this.setupSquirrel();
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