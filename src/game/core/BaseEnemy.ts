import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';

interface EnemyOptions {
  name: string;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  moveX: number;
  moveY: number;
  direction: number;
  scale: number;
  health: number;
  friction: number;
}

export class BaseEnemy extends PhysicsObject {
  protected isDead: boolean = false;
  protected enemyOptions: EnemyOptions;

  protected health: number;

  constructor(scene: Phaser.Scene, x: number, y: number, options: EnemyOptions) {
    super(scene, x, y, {
      name: options.name,
      moveX: options.moveX,
      moveY: options.moveY,
      direction: options.direction,
      depthOffset: 0,
      acceleration: options.acceleration,
      deceleration: options.deceleration,
      maxVelocityX: options.maxVelocityX,
      maxVelocityY: options.maxVelocityY,
      friction: options.friction,
      shadow: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      debug: {
        enabled: true,
        showPositions: true,
        showPhysics: true,
        showSprites: true,
        logCreation: true,
        showPath: true,
      },
    });

    this.enemyOptions = { ...options };
    this.health = options.health;
    this.sprite.setData('enemyRef', this);
  }
  
  public takeDamage(damage: number): void {
    console.log('takeDamage', damage);
    if (this.isDead) return;
    
    this.health -= damage;

    if (this.health <= 0) {
      this.onDeath();
    }
  }

  private onDeath(): void {
    // Вызываем событие окончания игры
    this.scene.events.emit('gameOver', false);
    
    // Уничтожаем объект игрока
    this.destroy();
  }
  
  public update(time: number, delta: number): void {
    // Проверяем, не вышел ли враг за левую границу экрана
    if (this.x < 0) {
      this.scene.events.emit('gameOver', false);
      this.destroy();
    }

    super.update(time, delta);
  }
} 