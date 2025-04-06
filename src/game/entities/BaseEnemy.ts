import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';

export class BaseEnemy extends PhysicsObject {
  name = `Enemy`;
  direction: number = -1;

  maxVelocityX: number = 20;
  maxVelocityY: number = 5;
  acceleration: number = 10;
  deceleration: number = 8;
  friction: number = 0;

  protected isDead: boolean = false;
  protected health: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Сохраняем ссылку на объект BaseEnemy в данных спрайта
    this.sprite.setData('enemyRef', this);
    
    // Настраиваем врага
    this.setupEnemy();
  }
  
  private setupEnemy(): void {
    // this.sprite.setVelocityX(this.speed * this.direction);
  }
 
  public takeDamage(damage: number): void {
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