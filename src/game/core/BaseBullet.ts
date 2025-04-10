import * as Phaser from 'phaser';
import { createLogger } from '../../utils/logger';

const logger = createLogger('BaseBullet');

export interface BaseBulletOptions {
  color: number;
  width: number;
  height: number;
}

const defaultOptions: BaseBulletOptions = {
  color: 0xffffff,
  width: 10,
  height: 4,
};

export class BaseBullet {
  protected scene: Phaser.Scene;
  protected sprite: Phaser.Physics.Arcade.Sprite;
  protected bulletGraphic: Phaser.GameObjects.Graphics;
  
  private damage: number = 10;
  private range: number = 500;
  private startX: number = 0;
  private startY: number = 0;
  private isActive: boolean = false;
  protected options: BaseBulletOptions;
  
  constructor(scene: Phaser.Scene, x: number, y: number, options?: BaseBulletOptions) {
    this.scene = scene;
    this.options = { ...defaultOptions, ...options };
    logger.debug(`Создана пуля: цвет=${this.options.color.toString(16)}, размер=${this.options.width}x${this.options.height}`);
    
    // Создаем графику для пули
    this.bulletGraphic = scene.add.graphics();
    this.drawBullet();
    
    // Создаем спрайт для физики на основе текстуры из графики
    const key = `bullet_${this.options.color.toString(16)}_${this.options.width}x${this.options.height}`;
    
    if (!scene.textures.exists(key)) {
      // Создаем текстуру из графики
      this.bulletGraphic.generateTexture(key, this.options.width, this.options.height);
    }
    
    // Создаем физический спрайт с этой текстурой
    this.sprite = scene.physics.add.sprite(x, y, key);
    this.sprite.setSize(this.options.width, this.options.height);
    this.sprite.setDisplaySize(this.options.width, this.options.height);
    
    // Настраиваем физические свойства
    this.sprite.setGravity(0, 0);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setBounce(0);
    this.sprite.setDepth(100);
    
    // Сохраняем ссылку на объект BaseBullet в данных спрайта
    this.sprite.setData('bulletRef', this);
    
    // Больше не нужна отдельная графика, она теперь в текстуре
    this.bulletGraphic.clear();
    this.bulletGraphic.setVisible(false);
    
    this.setupBullet();
  }
  
  /**
   * Отрисовка графики пули
   */
  protected drawBullet(): void {
    this.bulletGraphic.clear();
    
    // Центрируем графику вокруг (0,0)
    this.bulletGraphic.translateCanvas(this.options.width / 2, this.options.height / 2);
    
    // Рисуем прямоугольник с закругленными краями нужного цвета
    this.bulletGraphic.fillStyle(this.options.color, 1);
    this.bulletGraphic.fillRoundedRect(
      -this.options.width / 2, 
      -this.options.height / 2, 
      this.options.width, 
      this.options.height,
      this.options.height / 2
    );
  }
  
  protected setupBullet(): void {
    this.sprite.setActive(false);
    this.sprite.setVisible(false);
  }
  
  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
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
    
    this.fireEffect();
    
    logger.debug(`Пуля выпущена из (${x.toFixed(0)}, ${y.toFixed(0)}) в направлении (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`);
  }

  fireEffect(): void {
    // Добавляем специальный эффект при выстреле
    if (this.scene.textures.exists('particle')) {
      const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
        speed: 20,
        scale: { start: 0.2, end: 0 },
        blendMode: 'ADD',
        lifespan: 200,
        emitting: false
      });
      
      // Делаем одну вспышку и затем останавливаем
      particles.explode(10);
      
      // Уничтожаем эмиттер через короткий промежуток времени
      this.scene.time.delayedCall(300, () => {
        particles.destroy();
      });
    }
  }

  hitEffect(): void {
    // Создаем небольшой эффект попадания
    const hitEffect = this.scene.add.circle(this.sprite.x, this.sprite.y, 5, this.options.color);
    hitEffect.setAlpha(0.8);
    
    // Анимируем эффект попадания
    this.scene.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
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

  public getDirection(): number {
    return this.sprite.rotation;
  }
  
  public deactivate(): void {
    this.isActive = false;
    this.sprite.setActive(false);
    this.sprite.setVisible(false);
    this.sprite.setVelocity(0, 0);
  }
  
  public onHit(): void {
    logger.debug('Пуля попала в цель');
    this.hitEffect();
    this.deactivate();
  }
  
  public destroy(): void {
    if (this.bulletGraphic) {
      this.bulletGraphic.destroy();
    }
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 