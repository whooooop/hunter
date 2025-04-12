import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';
import { BaseBlood } from './BaseBlood';
import { DecalManager } from './DecalManager';

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
  decalManager?: DecalManager;
}

interface DamageInfo {
  damage: number;
  forceVector: number[][];
  hitPoint: number[];
}

export class BaseEnemy extends PhysicsObject {
  protected isDead: boolean = false;
  protected enemyOptions: EnemyOptions;
  protected decalManager: DecalManager | null = null;
  protected health: number;
  protected blood: BaseBlood;

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
    this.decalManager = options.decalManager || null;
    this.health = options.health;
    // Инициализируем систему крови с передачей общей текстуры для декалей
    this.blood = new BaseBlood(this.scene, { decalManager: options.decalManager });
    this.sprite.setData('enemyRef', this);
  }
  
  public takeDamage({ damage, forceVector, hitPoint }: DamageInfo): void {
    if (this.isDead) return;

    this.health -= damage;

    this.createBloodSplash({ damage, forceVector, hitPoint });

    if (this.health <= 0) {
      this.onDeath();
    }
  }

  private createBloodSplash({ damage, forceVector, hitPoint }: DamageInfo): void {
    if (!this.blood) return;

    const [x, y] = hitPoint;
    const [[startX, startY], [forceX, forceY]] = forceVector;
    const direction = forceX - startX;

    this.blood.createBloodSplash(x, y,
      {
        amount: Phaser.Math.Between(50, 100),
        direction,
        force: 20,
        size: {
          min: 0.2,
          max: 0.3
        },
        speed: {
          min: 500,
          max: 1080,
          multiplier: 0.6
        },
        gravity: 700,
        spread: {
          angle: Math.PI/14,
          height: {
            min: -3, // Разброс вверх от точки попадания
            max: 2   // Разброс вниз от точки попадания
          }
        },
        fallDistance: {
          min: 15,
          max: 25
        },
        // minXDistance: 380      // Минимальная дистанция разлета по оси X
      }
    );
  }

  // Вызываем событие окончания игры
  private onDeath(): void {
    // Вызываем событие окончания игры
    this.scene.events.emit('gameOver', false);
    
    // Уничтожаем объект игрока
    this.destroy();
  }
  
  public getBounds(): Phaser.Geom.Rectangle {
    return this.sprite.getBounds();
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