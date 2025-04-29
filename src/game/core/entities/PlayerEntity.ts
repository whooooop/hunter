import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import { LocationBounds } from '../BaseLocation';
import { WeaponEntity } from './WeaponEntity';
import { ShadowEntity } from './ShadowEntity';
import { offEvent, onEvent } from '../Events';
import { Player } from '../types/playerTypes';
import { MotionController2 } from '../controllers/MotionController2';
import { PlayerBodyTexture, PlayerHandTexture, PlayerLegLeftTexture, PlayerLegRightTexture } from '../../textures/PlayerTexture';

const logger = createLogger('Player');

export class PlayerEntity {
  name = 'Player';

  private id: string;
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private body: Phaser.Physics.Arcade.Body;

  private playerBody: Phaser.GameObjects.Image;
  private frontHand: Phaser.GameObjects.Image;
  private backHand: Phaser.GameObjects.Image;
  private leftLeg: Phaser.GameObjects.Image;
  private rightLeg: Phaser.GameObjects.Image;
  private weaponContainer: Phaser.GameObjects.Container;

  private motionController: MotionController2;
  private canChangeDirection: boolean = false;

  private currentWeapon!: WeaponEntity | null;
  
  private moveX: number = 0;
  private moveY: number = 0;
  private direction: number = 1;

  private bodyHeight: number = 50;
  private bodyWidth: number = 50;
  private containerOffsetY: number = 20;

  // Целевая позиция для интерполяции
  private targetX: number | null = null;
  private targetY: number | null = null;

  private shadow!: ShadowEntity;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(PlayerBodyTexture.key, PlayerBodyTexture.url);
    scene.load.image(PlayerHandTexture.key, PlayerHandTexture.url);
    scene.load.image(PlayerLegLeftTexture.key, PlayerLegLeftTexture.url);
    scene.load.image(PlayerLegRightTexture.key, PlayerLegRightTexture.url);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    this.id = id;
    this.scene = scene;
    this.container = scene.add.container(x, y);
    

    this.body = scene.physics.add.body(x, y, this.bodyWidth, this.bodyHeight);
    this.shadow = new ShadowEntity(scene, this.body);
    this.playerBody = scene.add.image(0, 0, PlayerBodyTexture.key).setScale(PlayerBodyTexture.scale);
    this.frontHand = scene.add.image(0, 0, PlayerHandTexture.key).setScale(PlayerHandTexture.scale).setPosition(-6, 24);
    this.backHand = scene.add.image(0, 0, PlayerHandTexture.key).setScale(PlayerHandTexture.scale).setPosition(14, 16);
    this.leftLeg = scene.add.image(0, 0, PlayerLegLeftTexture.key).setScale(PlayerLegLeftTexture.scale).setOrigin(0.5, 1).setPosition(-10, 47);
    this.rightLeg = scene.add.image(0, 0, PlayerLegRightTexture.key).setScale(PlayerLegRightTexture.scale).setOrigin(0.5, 1).setPosition(6, 44);
    this.weaponContainer = scene.add.container(0, 0);

    this.container.add(this.backHand);
    this.container.add(this.shadow.getContainer());
    this.container.add(this.leftLeg);
    this.container.add(this.rightLeg);
    this.container.add(this.playerBody);
    this.container.add(this.weaponContainer);
    this.container.add(this.frontHand);

    this.motionController = new MotionController2(scene, this.body, {
      acceleration: 700,
      deceleration: 500,
      friction: 800,
      maxVelocityX: 200,
      maxVelocityY: 200,
      direction: 1,
    });
    
    onEvent(scene, Player.Events.State.Remote, this.handlePlayerStateRemote, this);
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
      this.weaponContainer.remove(this.currentWeapon.getContainer());
    }
    this.currentWeapon = weapon;
    this.currentWeapon.setPosition(0, 0, this.direction);
    this.weaponContainer.add(weapon.getContainer());
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
      this.body.x = Phaser.Math.Interpolation.Linear([this.body.x, this.targetX], lerpFactor);
      this.body.y = Phaser.Math.Interpolation.Linear([this.body.y, this.targetY], lerpFactor);
      // Если очень близко к цели, "примагничиваемся", чтобы избежать дрожания
      // if (Phaser.Math.Distance.Between(this.body.x, this.body.y, this.targetX, this.targetY) < 1) {
      //   this.body.x = this.targetX;
      //   this.body.y = this.targetY;
      // }
    }

    this.container.setDepth(position.depth);
    this.container.setPosition(position.x, position.y - this.containerOffsetY);

    if (this.shadow) {
      this.shadow
        .getContainer()
        .setPosition(0, this.body.height / 2 + this.containerOffsetY - position.jumpHeight);
    }

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
  //     this.container.setFlipX(direction === -1);
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
    offEvent(this.scene, Player.Events.State.Remote, this.handlePlayerStateRemote, this);
  }
} 