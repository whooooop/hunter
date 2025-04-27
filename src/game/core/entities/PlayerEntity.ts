import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import playerImage from '../../../assets/images/player.png';
import { LocationBounds } from '../BaseLocation';
import { WeaponEntity } from './WeaponEntity';
import { MotionController } from '../controllers/MotionController';
import { ShadowEntity } from './ShadowEntity';
import { onEvent } from '../Events';
import { Player } from '../types/playerTypes';
import { MotionController2 } from '../controllers/MotionController2';

const TEXTURE_PLAYER = 'player';

const logger = createLogger('Player');

export class PlayerEntity {
  name = 'Player';

  private id: string;
  private scene: Phaser.Scene;
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private container: Phaser.GameObjects.Container;
  private body: Phaser.Physics.Arcade.Body;

  private motionController: MotionController2;
  private canChangeDirection: boolean = false;

  private currentWeapon!: WeaponEntity | null;
  
  private moveX: number = 0;
  private moveY: number = 0;
  private direction: number = 1;

  // Целевая позиция для интерполяции
  private targetX: number | null = null;
  private targetY: number | null = null;

  private shadow: ShadowEntity;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_PLAYER, playerImage);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    this.id = id;
    this.scene = scene;
    this.gameObject = scene.physics.add.sprite(0, 0, TEXTURE_PLAYER);
    this.gameObject.setScale(0.5);

    this.shadow = new ShadowEntity(scene, this.gameObject);

    this.body = scene.physics.add.body(x, y, this.gameObject.width * this.gameObject.scale, this.gameObject.height * this.gameObject.scale);

    this.container = scene.add.container(x, y);
    this.container.add(this.gameObject);
    this.container.add(this.shadow);

    this.motionController = new MotionController2(scene, this.body, {
      acceleration: 400,
      deceleration: 340,
      friction: 800,
      maxVelocityX: 300,
      maxVelocityY: 300,
      direction: 1,
    });

    scene.add.existing(this.container);

    onEvent(scene, Player.Events.State.Remote, this.handlePlayerStateRemote.bind(this));
  }

  private handlePlayerStateRemote(payload: Player.Events.State.Payload): void {
    if (payload.playerId !== this.id) {
      return;
    }

    // Сохраняем целевую позицию вместо прямого присваивания
    this.targetX = payload.position.x;
    this.targetY = payload.position.y;
  }

  public getId(): string {
    return this.id;
  }

  public getPosition(): [number, number] {
    return [this.body.x, this.body.y];
  }

  public setWeapon(weapon: WeaponEntity): void {
    if (this.currentWeapon) {
      this.container.remove(this.currentWeapon.getGameObject());
    }
    this.currentWeapon = weapon
    this.currentWeapon.setPosition(0, 0, this.direction);
    this.container.add(weapon.getGameObject());
  }

  public setLocationBounds(bounds: LocationBounds): void {
    this.motionController.setLocationBounds(bounds);
  }
  
  /**
   * Возвращает текущее оружие игрока
   */
  public getWeapon(): WeaponEntity | null {
    return this.currentWeapon || null;
  }
  
  public update(time: number, delta: number): void {
    this.motionController.update(time, delta);
    const position = this.motionController.getPosition();

    // Интерполяция к целевой позиции
    if (this.targetX && this.targetY) {
      const lerpFactor = 0.15; // Коэффициент сглаживания (0-1). Меньше значение -> плавнее движение.
      this.gameObject.x = Phaser.Math.Interpolation.Linear([this.gameObject.x, this.targetX], lerpFactor);
      this.gameObject.y = Phaser.Math.Interpolation.Linear([this.gameObject.y, this.targetY], lerpFactor);
      // Если очень близко к цели, "примагничиваемся", чтобы избежать дрожания
      // if (Phaser.Math.Distance.Between(this.gameObject.x, this.gameObject.y, this.targetX, this.targetY) < 1) {
      //   this.gameObject.x = this.targetX;
      //   this.gameObject.y = this.targetY;
      // }
    }

    this.container.setDepth(position.depth);
    this.container.setPosition(position.x, position.y);
    this.shadow.update(time, delta, position.jumpHeight);

    if (this.currentWeapon) {
      this.currentWeapon.update(time, delta);
    }
  }

  public getPlayerState(): Player.Events.State.Payload {
    return { 
      playerId: this.id, 
      position: { x: this.container.x, y: this.container.y } 
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
  public jump(): void {
    this.motionController.jump();
  }

  
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

  // Геттер для получения текущего направления игрока
  public getDirection(): number {
    return this.direction;
  }

  public destroy(): void {
    this.container.destroy();
    this.body.destroy();
    this.motionController.destroy();
  }
} 