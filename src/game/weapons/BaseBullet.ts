import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';

export class BaseBullet extends PhysicsObject {
  private damage: number = 10;
  private range: number = 500;
  private startX: number = 0;
  private startY: number = 0;
  private isActive: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y);
    this.name = 'Bullet';
    this.setupBullet();
    
    // Сохраняем ссылку на объект BaseBullet в данных спрайта
    this.sprite.setData('bulletRef', this);
  }
  
  private setupBullet(): void {
    this.sprite.setActive(false);
    this.sprite.setVisible(false);
  }
  
  public fire(x: number, y: number, targetX: number, targetY: number, speed: number, damage: number, range: number): void {
    this.startX = x;
    this.startY = y;
    this.damage = damage;
    this.range = range;
    
    // Устанавливаем позицию
    this.sprite.setPosition(x, y);
    this.sprite.setActive(true);
    this.sprite.setVisible(true);
    
    this.isActive = true;
    
    // Вычисляем направление
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    
    // Рассчитываем скорость в зависимости от направления
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    // Устанавливаем скорость
    this.sprite.setVelocity(velocityX, velocityY);
    
    // Поворачиваем спрайт в направлении движения
    this.sprite.setRotation(angle);
    
    console.log(`Пуля выпущена из (${x}, ${y}) в направлении (${targetX}, ${targetY})`);
  }
  
  public update(time: number, delta: number): void {
    if (!this.isActive) return;
    
    // Проверяем, не превысили ли дальность полета
    const distance = Phaser.Math.Distance.Between(
      this.startX, this.startY, 
      this.sprite.x, this.sprite.y
    );
    
    if (distance > this.range) {
      this.deactivate();
    }
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public deactivate(): void {
    this.isActive = false;
    this.sprite.setActive(false);
    this.sprite.setVisible(false);
    this.sprite.setVelocity(0, 0);
  }
  
  public onHit(): void {
    console.log('Пуля попала в цель');
    this.deactivate();
  }
} 