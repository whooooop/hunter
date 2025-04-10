import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { createLogger } from '../../utils/logger';
import { LocationBounds } from '../core/BaseLocation';

const logger = createLogger('Player');

export class Player extends PhysicsObject {
  name = 'Player';

  canChangeDirection: boolean = false;

  private weapon!: BaseWeapon;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;
  private jumpKey: Phaser.Input.Keyboard.Key;
  
  // Параметры прыжка
  private isJumping: boolean = false;
  private jumpHeight: number = 40; // Максимальная высота прыжка
  private jumpProgress: number = 0; // Прогресс прыжка (0-1)
  private jumpDuration: number = 500; // Длительность прыжка в мс
  private jumpTimer: number = 0; // Таймер прыжка
  private jumpOffsetY: number = 0; // Текущее смещение по Y из-за прыжка
  
  // Границы локации
  private locationBounds: LocationBounds | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super('player', scene, x, y, {
      depthOffset: 0,
      acceleration: 15,
      deceleration: 8,
      friction: 6,
      maxVelocityX: 300,
      maxVelocityY: 300,
      shadow: {
        scale: 1,
        offsetX: 5,
        offsetY: 4,
      },
    });
    
    // Настраиваем курсоры для управления
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.direction = 1;
  }
  
  /**
   * Назначает игроку указанное оружие
   * @param weapon Оружие для назначения
   */
  public setWeapon(weapon: BaseWeapon): void {
    // Если у игрока уже есть оружие, уничтожаем его
    if (this.weapon) {
      this.weapon.destroy();
    }
    
    weapon.create(this);
    this.weapon = weapon;

    logger.info(`Игроку назначено оружие: ${this.weapon.getId()}`);
  }

  public setLocationBounds(bounds: LocationBounds): void {
    this.locationBounds = bounds;
  }
  
  /**
   * Возвращает текущее оружие игрока
   */
  public getWeapon(): BaseWeapon | null {
    return this.weapon || null;
  }
  
  public update(time: number, delta: number): void {
    // Обрабатываем управление
    this.handleMovement();
    
    // Обрабатываем прыжок
    this.handleJump(time, delta);

    // Обрабатываем стрельбу и обновляем оружие только если оно назначено
    if (this.weapon) {
      this.handleFiring(time);
      this.handleReloading();
      this.weapon.update(time, delta);
    }
    
    // Вызываем базовый метод обновления физического объекта
    super.update(time, delta);
    
    // Применяем смещение от прыжка к визуальной позиции
    if (this.isJumping) {
      this.sprite.setPosition(this.x, this.y - this.jumpOffsetY);
      
      // При прыжке тень должна оставаться на земле
      if (this.shadowSprite) {
        this.shadowSprite.setPosition(
          this.x + 5,
          this.y + this.sprite.height / 2 + 4
        );
      }
    }
    
    // Ограничиваем позицию игрока внутри границ локации
    if (this.locationBounds) {
      this.constrainPosition(this.locationBounds);
    }
  }
  
  private handleMovement(): void {
    if (this.cursors.left.isDown) {
      this.moveX = -1;
      this.handleDirectionChange(-1);
    } else if (this.cursors.right.isDown) {
      this.moveX = 1;
      this.handleDirectionChange(1);
    } else {
      this.moveX = 0;
    }
    
    if (this.cursors.up.isDown) {
      this.moveY = -1;
    } else if (this.cursors.down.isDown) {
      this.moveY = 1;
    } else {
      this.moveY = 0;
    }
    
    // Проверяем нажатие клавиши прыжка
    if (this.jumpKey.isDown && !this.isJumping) {
      this.startJump();
    }
  }
  
  /**
   * Запускает прыжок игрока
   */
  private startJump(): void {
    this.isJumping = true;
    this.jumpProgress = 0;
    this.jumpTimer = 0;
  }
  
  /**
   * Обрабатывает логику прыжка
   */
  private handleJump(time: number, delta: number): void {
    if (!this.isJumping) return;
    
    // Увеличиваем таймер прыжка
    this.jumpTimer += delta;
    
    // Рассчитываем прогресс прыжка (0-1)
    this.jumpProgress = Math.min(this.jumpTimer / this.jumpDuration, 1);
    
    // Если прыжок завершился
    if (this.jumpProgress >= 1) {
      this.isJumping = false;
      this.jumpOffsetY = 0;
      return;
    }
    
    // Рассчитываем смещение по синусоиде для плавного прыжка
    // sin(π * progress) даст нам плавную дугу, которая поднимается и опускается
    this.jumpOffsetY = this.jumpHeight * Math.sin(Math.PI * this.jumpProgress);
  }
  
  private handleDirectionChange(direction: number): void {
    if (this.canChangeDirection) {
      this.direction = direction;
      this.sprite.setFlipX(direction === -1);
    }
  }

  private handleFiring(time: number): void {
    if (this.fireKey.isDown) {
      this.weapon.fire(this.sprite.x, this.sprite.y, this.direction);
    } else {
      this.weapon.resetTrigger();
    }
  }

  /**
   * Ограничивает позицию игрока внутри заданных границ
   */
  private constrainPosition(bounds: LocationBounds): void {
    if (bounds) {
      if (this.x < bounds.left) this.x = bounds.left;
      if (this.x > bounds.right) this.x = bounds.right;
      if (this.y < bounds.top) this.y = bounds.top;
      if (this.y > bounds.bottom) this.y = bounds.bottom;
    }
  }

  private handleReloading(): void {
    if (this.reloadKey.isDown) {
      this.weapon.reload();
    }
  }
  
  // Геттер для получения текущего направления игрока
  public getDirection(): number {
    return this.direction;
  }
  
  // Геттер для получения спрайта игрока
  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
} 