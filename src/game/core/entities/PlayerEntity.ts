import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import { Location } from '../types/Location';
import { WeaponEntity } from './WeaponEntity';
import { ShadowEntity } from './ShadowEntity';
import { offEvent, onEvent } from '../Events';
import { Player } from '../types/playerTypes';
import { MotionController2 } from '../controllers/MotionController2';
import { PlayerBodyTexture, PlayerHandTexture, PlayerLegLeftTexture, PlayerLegRightTexture } from '../../textures/PlayerTexture';
import JumpAudioUrl from '../../assets/audio/jump.mp3';
import { SettingsService } from '../services/SettingsService';

const logger = createLogger('Player');
const settingsService = SettingsService.getInstance();

const LEG_WALK_MAX_ROTATION = Phaser.Math.DegToRad(30);
const LEG_JUMP_ROTATION = Phaser.Math.DegToRad(45);
const WALK_CYCLE_SPEED_FACTOR = 0.05; // Множитель для скорости анимации ходьбы (подбирается экспериментально)
const BODY_WALK_MAX_ROTATION = Phaser.Math.DegToRad(1); // Максимальный угол наклона тела при ходьбе


const jumpAudio = {
  key: 'player_jump',
  url: JumpAudioUrl,
}

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

  // Анимация ног
  private walkPhase: number = 0; // Текущая фаза анимации ходьбы
  private legReturnSpeed: number = Phaser.Math.DegToRad(360); // Скорость возврата ног в покой (градусы в секунду)

  private shadow!: ShadowEntity;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(PlayerBodyTexture.key, PlayerBodyTexture.url);
    scene.load.image(PlayerHandTexture.key, PlayerHandTexture.url);
    scene.load.image(PlayerLegLeftTexture.key, PlayerLegLeftTexture.url);
    scene.load.image(PlayerLegRightTexture.key, PlayerLegRightTexture.url);
    scene.load.audio(jumpAudio.key, jumpAudio.url);
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
    this.leftLeg = scene.add.image(0, 0, PlayerLegLeftTexture.key).setScale(PlayerLegLeftTexture.scale).setOrigin(0.5, 0).setPosition(-10, 30);
    this.rightLeg = scene.add.image(0, 0, PlayerLegRightTexture.key).setScale(PlayerLegRightTexture.scale).setOrigin(0.5, 0).setPosition(6, 28);
    this.weaponContainer = scene.add.container(0, 0);

    this.container.add(this.backHand);1
    this.container.add(this.shadow.getContainer());
    this.container.add(this.leftLeg);
    this.container.add(this.rightLeg);
    this.container.add(this.playerBody);
    this.container.add(this.weaponContainer);
    this.container.add(this.frontHand);

    this.leftLeg.setRotation(0);
    this.rightLeg.setRotation(0);

    this.motionController = new MotionController2(scene, this.body, {
      acceleration: 700,
      deceleration: 500,
      friction: 800,
      maxVelocityX: 200,
      maxVelocityY: 200,
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

  public setLocationBounds(bounds: Location.Bounds): void {
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
    const isMoving = this.motionController.getVelocity().length() !== 0;
    const isJumping = this.motionController.isJumping();

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

    if (isJumping) {
      this.leftLeg.setRotation(-LEG_JUMP_ROTATION);
      this.rightLeg.setRotation(LEG_JUMP_ROTATION);
      this.playerBody.setRotation(0); // Сбрасываем вращение тела при прыжке
      this.walkPhase = 0; // Сбрасываем фазу при прыжке
    } else if (isMoving) {
      const velocity = this.motionController.getVelocity();
      const speed = velocity.length();
      const maxSpeed = this.motionController.getMaxSpeed();
      // Рассчитываем линейный фактор скорости (от 0 до 1)
      const linearSpeedFactor = maxSpeed > 0 ? Phaser.Math.Clamp(speed / maxSpeed, 0, 1) : 0;

      // Применяем ease-out функцию для получения нелинейного фактора скорости
      // Анимация будет быстрее нарастать в начале и медленнее в конце
      const easedSpeedFactor = Phaser.Math.Easing.Expo.Out(linearSpeedFactor);

      // Рассчитываем динамическую скорость изменения фазы, используя нелинейный фактор
      // Умножаем на delta, чтобы получить приращение за кадр
      const phaseIncrement = WALK_CYCLE_SPEED_FACTOR * easedSpeedFactor * delta;

      // Накапливаем фазу
      this.walkPhase += phaseIncrement;

      // Анимация ходьбы ног
      const legWalkCycle = Math.sin(this.walkPhase) * LEG_WALK_MAX_ROTATION;
      this.leftLeg.setRotation(legWalkCycle);
      this.rightLeg.setRotation(-legWalkCycle);

      // Анимация покачивания тела (в противофазе с ногами)
      const bodyWalkCycle = -Math.sin(this.walkPhase) * BODY_WALK_MAX_ROTATION;
      this.playerBody.setRotation(bodyWalkCycle);

    } else {
      // Плавно возвращаем ноги и тело в 0, если не двигаемся и не прыгаем
      const step = this.legReturnSpeed * (delta / 1000); // Шаг поворота за кадр
      this.leftLeg.rotation = Phaser.Math.Angle.RotateTo(this.leftLeg.rotation, 0, step);
      this.rightLeg.rotation = Phaser.Math.Angle.RotateTo(this.rightLeg.rotation, 0, step);
      this.playerBody.rotation = Phaser.Math.Angle.RotateTo(this.playerBody.rotation, 0, step);

      // Сбрасываем фазу, когда ноги почти вернулись в 0, чтобы избежать накопления ошибки
      if (Math.abs(this.leftLeg.rotation) < Phaser.Math.DegToRad(1)) {
           this.walkPhase = 0;
      }
    }

    if (this.shadow) {
      // this.shadow
      //   .getContainer()
      //   .setPosition(0, this.body.height / 2 + this.containerOffsetY - position.jumpHeight);
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
    if (this.motionController.isJumping()) {
      return;
    }
    this.motionController.jump();
    this.scene.sound.play(jumpAudio.key, { volume: settingsService.getValue('audioEffectsVolume') as number });
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