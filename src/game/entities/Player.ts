import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { createLogger } from '../../utils/logger';

const logger = createLogger('Player');

export class Player extends PhysicsObject {
  name = 'Player';
  direction = 1;

  canChangeDirection: boolean = false;

  acceleration: number = 15;
  deceleration: number = 8;
  friction: number = 6;
  maxVelocityX: number = 300;
  maxVelocityY: number = 300;

  private weapon!: BaseWeapon;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super('player', scene, x, y);
    
    // Настраиваем курсоры для управления
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // Оружие будет назначено позже через setWeapon
    logger.info('Игрок создан без оружия');
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
  
  /**
   * Возвращает текущее оружие игрока
   */
  public getWeapon(): BaseWeapon | null {
    return this.weapon || null;
  }
  
  public update(time: number, delta: number): void {
    // Обрабатываем управление
    this.handleMovement();

    // Обрабатываем стрельбу и обновляем оружие только если оно назначено
    if (this.weapon) {
      this.handleFiring(time);
      this.handleReloading();
      this.weapon.update(time, delta);
    }
    
    super.update(time, delta);
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