import { StorageSpace, SyncCollectionRecord } from '@hunter/multiplayer/dist/client';
import { PlayerJumpEvent } from '@hunter/storage-proto/dist/storage';
import * as Phaser from 'phaser';
import JumpAudioUrl from '../assets/audio/jump.mp3';
import { MotionController2 } from '../controllers/MotionController2';
import { offEvent, onEvent } from '../GameEvents';
import { SettingsService } from '../services/SettingsService';
import { jumpEventCollection } from '../storage/collections/events.collectio';
import { PlayerBodyTexture, PlayerHandTexture, PlayerLegLeftTexture, PlayerLegRightTexture } from '../textures/PlayerTexture';
import { Player } from '../types';
import { Controls } from '../types/ControlsTypes';
import { Location } from '../types/Location';
import { createLogger } from '../utils/logger';
import { generateId } from '../utils/stringGenerator';
import { ShadowEntity } from './ShadowEntity';
import { WeaponEntity } from './WeaponEntity';

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

  private direction: number = 1;

  private bodyHeight: number = 50;
  private bodyWidth: number = 50;
  private containerOffsetY: number = 20;

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

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly id: string,
    private readonly state: SyncCollectionRecord<Player.State>,
    private readonly storage: StorageSpace
  ) {
    this.id = id;
    this.scene = scene;
    this.container = scene.add.container(0, 0);

    this.body = scene.physics.add.body(state.data.x, state.data.y, this.bodyWidth, this.bodyHeight);
    this.shadow = new ShadowEntity(scene, this.body);
    this.playerBody = scene.add.image(0, 0, PlayerBodyTexture.key).setScale(PlayerBodyTexture.scale);
    this.frontHand = scene.add.image(0, 0, PlayerHandTexture.key).setScale(PlayerHandTexture.scale).setPosition(-6, 24);
    this.backHand = scene.add.image(0, 0, PlayerHandTexture.key).setScale(PlayerHandTexture.scale).setPosition(14, 16);
    this.leftLeg = scene.add.image(0, 0, PlayerLegLeftTexture.key).setScale(PlayerLegLeftTexture.scale).setOrigin(0.5, 0).setPosition(-10, 30);
    this.rightLeg = scene.add.image(0, 0, PlayerLegRightTexture.key).setScale(PlayerLegRightTexture.scale).setOrigin(0.5, 0).setPosition(6, 28);
    this.weaponContainer = scene.add.container(0, 0);

    this.container.add(this.backHand); 1
    this.container.add(this.shadow.getContainer());
    this.container.add(this.leftLeg);
    this.container.add(this.rightLeg);
    this.container.add(this.playerBody);
    this.container.add(this.weaponContainer);
    this.container.add(this.frontHand);

    this.leftLeg.setRotation(0);
    this.rightLeg.setRotation(0);

    this.motionController = new MotionController2(scene, this.body, {
      acceleration: 850,
      deceleration: 950,
      friction: 800,
      maxVelocityX: 250,
      maxVelocityY: 220,
    });

    this.motionController.setState(state);

    this.storage.on<PlayerJumpEvent>(jumpEventCollection, 'Add', (eventId: string, record: SyncCollectionRecord<PlayerJumpEvent>) => {
      if (record.data.playerId === this.id) {
        this.jumpAction();
      }
    });

    onEvent(this.scene, Controls.Events.Fire.Event, this.handleFire, this);
    onEvent(this.scene, Controls.Events.Reload.Event, this.handleReload, this);
    onEvent(this.scene, Controls.Events.Jump.Event, this.handleJump, this);
    onEvent(this.scene, Controls.Events.Move.Event, this.handleMove, this);
  }

  public getId(): string {
    return this.id;
  }

  public getPosition(): [number, number] {
    return [this.body.x, this.body.y];
  }

  private handleMove(payload: Controls.Events.Move.Payload): void {
    if (payload.playerId !== this.id) {
      return;
    }
    this.setMove(payload.moveX, payload.moveY);
  }

  private handleFire(payload: Controls.Events.Fire.Payload): void {
    if (payload.playerId !== this.id) {
      return;
    }
    if (payload.active) {
      this.fireOn();
    } else {
      this.fireOff();
    }
  }

  private handleReload(payload: Controls.Events.Reload.Payload): void {
    if (payload.playerId !== this.id) {
      return;
    }
    this.reload();
  }

  private handleJump(payload: Controls.Events.Jump.Payload): void {
    if (payload.playerId !== this.id) {
      return;
    }
    this.jump();
  }

  public setWeapon(weapon: WeaponEntity): void {
    if (this.currentWeapon) {
      this.weaponContainer.remove(this.currentWeapon.getContainer());
      this.currentWeapon.getContainer().setAlpha(0);
    }
    this.currentWeapon = weapon;
    this.currentWeapon.setPosition(0, 0, this.direction);
    this.weaponContainer.add(weapon.getContainer());
    this.currentWeapon.getContainer().setAlpha(1);
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
      this.shadow
        .getContainer()
        .setPosition(0, this.body.height / 2 + this.containerOffsetY - position.jumpHeight);
    }

    if (this.currentWeapon) {
      this.currentWeapon.update(time, delta);
    }
  }

  public setMove(moveX: number, moveY: number): void {
    // this.handleDirectionChange(-1);
    this.motionController.setMove(moveX, moveY);
  }

  /**
   * Запускает прыжок игрока
   */
  public jump(): void {
    if (this.motionController.isJumping()) {
      return;
    }
    this.storage.getCollection<PlayerJumpEvent>(jumpEventCollection)!.addItem(generateId(), { playerId: this.id });
    this.jumpAction();
  }

  private jumpAction(): void {
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

    offEvent(this.scene, Controls.Events.Fire.Event, this.handleFire, this);
    offEvent(this.scene, Controls.Events.Reload.Event, this.handleReload, this);
    offEvent(this.scene, Controls.Events.Jump.Event, this.handleJump, this);
    offEvent(this.scene, Controls.Events.Move.Event, this.handleMove, this);
  }
} 