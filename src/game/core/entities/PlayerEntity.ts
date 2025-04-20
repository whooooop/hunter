import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import playerImage from '../../../assets/images/player.png';
import { LocationBounds } from '../BaseLocation';
import { WeaponEntity } from './WeaponEntity';
import { MotionController } from '../controllers/MotionController';
import { ShadowEntity } from './ShadowEntity';
import { emitEvent, onEvent } from '../Events';
import { Player } from '../types/playerTypes';

const TEXTURE_PLAYER = 'player';

const logger = createLogger('Player');

export class PlayerEntity {
  name = 'Player';

  private id: string;
  private scene: Phaser.Scene;
  private gameObject: Phaser.Physics.Arcade.Sprite;

  private motionController: MotionController;
  private canChangeDirection: boolean = false;

  private currentWeapon!: WeaponEntity | null;
  
  private moveX: number = 0;
  private moveY: number = 0;
  private direction: number = 1;

  // Параметры прыжка
  public isJumping: boolean = false;
  private jumpHeight: number = 40; // Максимальная высота прыжка
  private jumpProgress: number = 0; // Прогресс прыжка (0-1)
  private jumpDuration: number = 500; // Длительность прыжка в мс
  private jumpTimer: number = 0; // Таймер прыжка
  private jumpOffsetY: number = 0; // Текущее смещение по Y из-за прыжка
  
  // Границы локации
  private locationBounds: LocationBounds | null = null;

  private shadow: ShadowEntity;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_PLAYER, playerImage);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    this.id = id;
    this.scene = scene;
    this.gameObject = scene.physics.add.sprite(x, y, TEXTURE_PLAYER);
    this.gameObject.setScale(0.5);

    this.shadow = new ShadowEntity(scene, this.gameObject);

    this.motionController = new MotionController(scene, this.gameObject, {
      acceleration: 20,
      deceleration: 14,
      friction: 10,
      maxVelocityX: 300,
      maxVelocityY: 300,
      direction: 1,
    });

    scene.add.existing(this.gameObject);

    onEvent(scene, Player.Events.State.Remote, this.handlePlayerStateRemote.bind(this));
  }

  private handlePlayerStateRemote(payload: Player.Events.State.Payload): void {
    console.log('handlePlayerStateRemote', payload.playerId);
    if (payload.playerId !== this.id) {
      return;
    }

    this.gameObject.x = payload.position.x;
    this.gameObject.y = payload.position.y;
  }

  public getId(): string {
    return this.id;
  }

  public getPosition(): [number, number] {
    return [this.gameObject.x, this.gameObject.y];
  }

  public setWeapon(weapon: WeaponEntity): void {
    this.currentWeapon = weapon
  }

  public setLocationBounds(bounds: LocationBounds): void {
    this.locationBounds = bounds;
  }
  
  /**
   * Возвращает текущее оружие игрока
   */
  public getWeapon(): WeaponEntity | null {
    return this.currentWeapon || null;
  }
  
  public update(time: number, delta: number): void {
    // Ограничиваем позицию игрока внутри границ локации
    if (this.locationBounds) {
      this.constrainPosition(this.locationBounds);
    }
    this.motionController.update(time, delta);
    this.shadow.update(time, delta);
     
    // Обрабатываем стрельбу и обновляем оружие только если оно назначено
    if (this.currentWeapon) {
      this.currentWeapon.setPosition(this.gameObject.x, this.gameObject.y, this.direction);
      this.currentWeapon.setDepth(this.gameObject.depth + 1);
      this.currentWeapon.update(time, delta);
    }
  }

  public getPlayerState(): Player.Events.State.Payload {
    return { 
      playerId: this.id, 
      position: { x: this.gameObject.x, y: this.gameObject.y } 
    };
  }
  
  public setMove(moveX: number, moveY: number): void {
    this.moveX = moveX;
    this.moveY = moveY;
    // this.handleDirectionChange(-1);
    this.motionController.setMove(this.moveX, this.moveY);
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
  // private handleJump(time: number, delta: number): void {
  //   if (!this.isJumping) return;
    
  //   // Увеличиваем таймер прыжка
  //   this.jumpTimer += delta;
    
  //   // Рассчитываем прогресс прыжка (0-1)
  //   this.jumpProgress = Math.min(this.jumpTimer / this.jumpDuration, 1);
    
  //   // Если прыжок завершился
  //   if (this.jumpProgress >= 1) {
  //     this.isJumping = false;
  //     this.jumpOffsetY = 0;
  //     return;
  //   }
    
  //   // Рассчитываем смещение по синусоиде для плавного прыжка
  //   // sin(π * progress) даст нам плавную дугу, которая поднимается и опускается
  //   this.jumpOffsetY = this.jumpHeight * Math.sin(Math.PI * this.jumpProgress);
  // }
  
  // private handleDirectionChange(direction: number): void {
  //   if (this.canChangeDirection) {
  //     this.direction = direction;
  //     this.gameObject.setFlipX(direction === -1);
  //   }
  // }

  public fireOn(): void {
    if (!this.currentWeapon) {
      return;
    }

    const recoilForce = this.currentWeapon.fire({ playerId: this.id });

    if (recoilForce) {
      this.motionController.applyForce(
        recoilForce.recoilVectorX,
        recoilForce.recoilVectorY,
        recoilForce.boostedForce,
        recoilForce.strength,
        recoilForce.decayRate
      );
    }
  }

  public fireOff(): void {
    if (!this.currentWeapon) {
      return;
    }
    this.currentWeapon.resetTrigger();
  }

  public reload(): void {
    if (!this.currentWeapon) {
      return;
    }
    this.currentWeapon?.reload();
  }

  /**
   * Ограничивает позицию игрока внутри заданных границ
   */
  private constrainPosition(bounds: LocationBounds): void {
    if (bounds) {
      if (this.gameObject.x < bounds.left) this.gameObject.x = bounds.left;
      if (this.gameObject.x > bounds.right) this.gameObject.x = bounds.right;
      if (this.gameObject.y < bounds.top) this.gameObject.y = bounds.top;
      if (this.gameObject.y > bounds.bottom) this.gameObject.y = bounds.bottom;
    }
  }

  // Геттер для получения текущего направления игрока
  public getDirection(): number {
    return this.direction;
  }
} 