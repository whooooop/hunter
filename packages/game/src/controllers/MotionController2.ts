import { SyncCollectionRecord } from "@hunter/multiplayer";
import { DEBUG, OBJECTS_DEPTH_OFFSET } from "../config";
import { Location } from "../types/Location";
import { hexToNumber } from "../utils/colors";
import { easeOutQuart, easeOutQuint, forceToTargetOffset } from "../utils/ForceUtils";
import { createLogger } from "../utils/logger";

const logger = createLogger('MotionController');

interface MotionControllerOptions {
  depthOffset?: number;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  friction: number;
  disableAccelerationWhenChangeDirection?: boolean;
}

// Интерфейс для внешней силы с целевым смещением
interface ExternalForce {
  // Целевое смещение
  targetOffsetX: number;
  targetOffsetY: number;

  // Текущее смещение
  currentOffsetX: number;
  currentOffsetY: number;

  // Параметры силы
  strength: number;        // Сила воздействия (0-1)
  remainingStrength: number; // Оставшаяся сила
  decayRate: number;       // Скорость затухания (0-1)

  // Новые параметры
  initialStrength: number; // Начальная сила для расчета затухания
  angle: number;           // Угол направления силы в радианах
  friction: number;        // Коэффициент трения для этой силы
}

export class MotionController2 {
  private scene: Phaser.Scene;
  private body: Phaser.Physics.Arcade.Body;
  private options: MotionControllerOptions;

  protected moveX: number = 0;
  protected moveY: number = 0;
  protected direction: number = 0;

  private jumping: boolean = false;
  private startJumpTime: number = 0;
  private jumpOffsetY: number = 0;
  private jumpHeight: number = 0;
  private jumpDuration: number = 0;
  private jumpStartY: number = 0;
  private preJumpVelocityY: number = 0;
  private jumpVelocityOffset: number = 0;
  private jumpTargetY: number = 0;

  private targetX: number = 0;
  private targetY: number = 0;
  private targetMaxVelocityX: number = 0;
  private targetMaxVelocityY: number = 0;
  private lerpFactorVelocity: number = 0.1;

  private previousMoveDirectionX: number = 0;
  private previousMoveDirectionY: number = 0;

  private locationBounds: Location.Bounds | null = null;

  // Параметры для внешних сил (отдача, ветер и т.д.)
  protected externalForces: ExternalForce[] = [];
  protected defaultDecayRate: number = 0.05; // Скорость затухания (чем меньше, тем медленнее)
  protected defaultForceStrength: number = 0.15; // Сила воздействия (чем больше, тем быстрее)
  protected forceThreshold: number = 0.01; // Порог для удаления силы

  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private debugRect!: Phaser.GameObjects.Rectangle;

  private state: SyncCollectionRecord<{ x: number, y: number, vx: number, vy: number }> | null = null;

  constructor(scene: Phaser.Scene, body: Phaser.Physics.Arcade.Body, options: MotionControllerOptions) {
    this.scene = scene;
    this.body = body;
    this.options = options;

    // Настраиваем физические свойства тела
    if (this.body) {
      this.body.setDrag(this.options.friction); // Используем friction как drag
      this.body.setMaxVelocity(this.options.maxVelocityX, this.options.maxVelocityY);
    }

    if (DEBUG.MOTION) {
      this.debugGraphics = scene.add.graphics();
      this.debugRect = scene.add.rectangle(this.body.x, this.body.y, this.body.width, this.body.height, 0x0000ff, 0.5);
    }
  }

  public increaseSpeed(percent: number): void {
    this.options.maxVelocityX *= 1 + percent;
    this.options.maxVelocityY *= 1 + percent;
    this.updateVelocity();
  }

  public decreaseSpeed(percent: number): void {
    this.moveX *= 1 - percent;
    this.moveY *= 1 - percent;
    this.updateVelocity();
  }

  public setState(state: SyncCollectionRecord<{ x: number, y: number, vx: number, vy: number }>): void {
    this.state = state;
  }

  public isMoving(): boolean {
    return this.moveX !== 0 || this.moveY !== 0;
  }

  public isJumping(): boolean {
    return this.jumping;
  }

  public getDepth(): number {
    const depthOffset = this.options.depthOffset || 0;
    return this.body.y + (this.body.height) + depthOffset + OBJECTS_DEPTH_OFFSET - this.jumpOffsetY;
  }

  public setMove(moveX: number, moveY: number): void {
    if (this.options.disableAccelerationWhenChangeDirection) {
      const currentMoveDirectionX = Math.sign(this.moveX);
      const currentMoveDirectionY = Math.sign(this.moveY);

      if (currentMoveDirectionX !== 0 && this.previousMoveDirectionX !== Math.sign(this.moveX)) {
        this.previousMoveDirectionX = currentMoveDirectionX;
        this.body.setVelocityX(0);
      }

      if (currentMoveDirectionY !== 0 && this.previousMoveDirectionY !== Math.sign(this.moveY)) {
        this.previousMoveDirectionY = currentMoveDirectionY;
        this.body.setVelocityY(0);
      }
    }

    this.moveX = moveX;
    this.moveY = moveY;
    this.updateVelocity();
  }

  private updateVelocity(): void {
    if (!this.body) return;

    // Нормализуем вектор направления, чтобы диагональное движение не было быстрее
    const moveVector = new Phaser.Math.Vector2(this.moveX, this.moveY).normalize();
    // Устанавливаем ускорение на физическое тело
    // Если moveX/moveY = 0, ускорение будет 0, и drag замедлит объект
    this.targetMaxVelocityX = Math.abs(this.moveX) * this.options.maxVelocityX;
    this.targetMaxVelocityY = Math.abs(this.moveY) * this.options.maxVelocityY;

    this.body.setAcceleration(moveVector.x * this.options.acceleration, moveVector.y * this.options.acceleration);

    // Сохраняем направление для других нужд (например, оружие)
    if (this.moveX < 0) {
      this.direction = -1;
    } else if (this.moveX > 0) {
      this.direction = 1;
    } else {
      // Если движение по X прекратилось, сохраняем последнее направление
      // this.direction остается прежним
    }
  }

  public setMoveDown(): void {
    if (this.moveY < 0) {
      this.setRevertY();
    }
  }

  public setMoveUp(): void {
    if (this.moveY > 0) {
      this.setRevertY();
    }
  }

  public setRevertY(): void {
    this.setMove(this.moveX, this.moveY * -1);
  }

  public update(time: number, delta: number): void {
    // Интерполяция к целевой позиции
    if (this.state?.readonly) {
      const lerpFactor = 0.15; // Коэффициент сглаживания (0-1). Меньше значение -> плавнее движение.
      this.body.x = Phaser.Math.Interpolation.Linear([this.body.x, this.state?.data.x], lerpFactor);
      this.body.y = Phaser.Math.Interpolation.Linear([this.body.y, this.state?.data.y], lerpFactor);
      this.setMove(this.state?.data.vx, this.state?.data.vy);
    }

    // Ускорение и максимальная скорость теперь обрабатываются физикой через setMove
    this.handleJump(time, delta);

    // Обновляем движение от внешних воздействий (отдача, ветер и т.д.) - все еще меняет позицию напрямую
    this.updateExternalForces(delta);

    if (this.locationBounds) {
      const halfWidth = this.body.width / 2;
      const halfHeight = this.body.height / 2;
      this.body.x = Math.max(this.locationBounds.left - halfWidth, Math.min(this.locationBounds.right - this.body.width, this.body.x));
      if (!this.jumping) {
        this.body.y = Math.max(this.locationBounds.top - halfHeight, Math.min(this.locationBounds.bottom - this.body.height, this.body.y));
      }
    }

    if (this.debugGraphics) {
      const position = this.getPosition();
      this.debugGraphics.clear();
      this.debugGraphics.setDepth(1000);
      this.debugGraphics.fillStyle(hexToNumber('#d23a3a'));
      this.debugGraphics.fillRect(this.body.x - 20, this.getDepth(), this.body.width + 40, 1);

      this.debugGraphics.lineStyle(2, hexToNumber('#fbb52f'), 1);
      this.debugGraphics.strokeRect(this.body.x, this.body.y, this.body.width, this.body.height);
    }

    if (Phaser.Math.Distance.Between(this.body.maxVelocity.x, this.body.maxVelocity.y, this.targetMaxVelocityX, this.targetMaxVelocityY) > 1) {
      this.body.setMaxVelocity(
        Phaser.Math.Interpolation.Linear([this.body.maxVelocity.x, this.targetMaxVelocityX], this.lerpFactorVelocity),
        Phaser.Math.Interpolation.Linear([this.body.maxVelocity.y, this.targetMaxVelocityY], this.lerpFactorVelocity)
      );
    }

    if (this.state && !this.state?.readonly) {
      this.state.data.x = parseInt(this.body.x.toFixed(0), 10);
      this.state.data.y = parseInt(this.body.y.toFixed(0), 10);
      this.state.data.vx = this.moveX;
      this.state.data.vy = this.moveY;
    }
  }

  public getPosition(): { x: number, y: number, moveX: number, moveY: number, velocityX: number, velocityY: number, jumpHeight: number, depth: number } {
    return {
      x: this.body.x + this.body.width / 2,
      y: this.body.y + this.body.height / 2,
      moveX: this.moveX,
      moveY: this.moveY,
      velocityX: this.body.velocity.x,
      velocityY: this.body.velocity.y,
      jumpHeight: this.jumpOffsetY,
      depth: this.getDepth(),
    };
  }

  public setTarget(x: number, y: number): void {
    this.targetX = x - this.body.width / 2;
    this.targetY = y - this.body.height / 2;
  }

  public getVelocityScale(): [number, number] {
    return [
      Math.abs(this.body.velocity.x) / this.options.maxVelocityX,
      Math.abs(this.body.velocity.y) / this.options.maxVelocityY
    ];
  }

  public setLocationBounds(bounds: Location.Bounds): void {
    this.locationBounds = bounds;
  }

  public jump(height: number = 100, duration: number = 500): void {
    if (this.jumping) return;
    this.startJumpTime = this.scene.time.now;
    this.jumpHeight = height;
    this.jumpDuration = duration;
    this.jumpOffsetY = 0;
    this.jumpStartY = this.body.y;
    this.preJumpVelocityY = this.body.velocity.y;

    // Рассчитываем смещение на основе сохраненной скорости
    const velocityFactor = Math.abs(this.preJumpVelocityY) / this.options.maxVelocityY;
    const maxOffset = this.body.height * 0.5;
    this.jumpVelocityOffset = maxOffset * velocityFactor * Math.sign(this.preJumpVelocityY);

    // Устанавливаем целевую позицию приземления
    this.jumpTargetY = this.jumpStartY + this.jumpVelocityOffset;

    this.jumping = true;
  }

  /**
   * Обрабатывает логику прыжка
   */
  private handleJump(time: number, delta: number): void {
    if (!this.jumping) return;

    const jumpProgress = Math.min((time - this.startJumpTime) / this.jumpDuration, 1);

    // Рассчитываем высоту прыжка
    this.jumpOffsetY = -1 * this.jumpHeight * Math.sin(Math.PI * jumpProgress);

    // Рассчитываем позицию с учетом и прыжка, и смещения к целевой точке
    const baseY = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * jumpProgress;
    this.body.y = baseY + this.jumpOffsetY;

    if (jumpProgress >= 1) {
      this.jumping = false;
      this.jumpOffsetY = 0;
      this.body.y = this.jumpTargetY;
      return;
    }
  }

  /**
   * Применяет внешнюю силу к объекту (отдача, ветер и т.д.)
   * @param vectorX Направление по X (-1 до 1)
   * @param vectorY Направление по Y (-1 до 1)
   * @param force Сила воздействия
   * @param strength Скорость приближения к цели (0-1)
   * @param decayRate Скорость затухания (0-1)
   */
  public applyForce(
    vectorX: number,
    vectorY: number,
    force: number,
    strength: number = this.defaultForceStrength,
    decayRate: number = this.defaultDecayRate
  ): void {
    // Рассчитываем угол направления силы
    const angle = Math.atan2(vectorY, vectorX);

    // Рассчитываем целевое смещение на основе направления и силы
    const targetOffset = forceToTargetOffset(force, angle, this.options.friction);

    // Создаем новую силу
    const externalForce: ExternalForce = {
      targetOffsetX: targetOffset.x,
      targetOffsetY: targetOffset.y,
      currentOffsetX: 0,
      currentOffsetY: 0,
      strength: Math.max(0, Math.min(1, strength)), // Ограничиваем в диапазоне 0-1
      initialStrength: force, // Сохраняем начальную силу
      remainingStrength: force, // Начинаем с полной силы
      decayRate: Math.max(0, Math.min(1, decayRate)), // Ограничиваем в диапазоне 0-1
      angle, // Сохраняем угол
      friction: this.options.friction // Используем трение объекта
    };

    // Добавляем силу в список активных
    this.externalForces.push(externalForce);
  }

  /**
   * Обновляет и применяет внешние силы к объекту
   * @param delta Дельта времени
   */
  protected updateExternalForces(delta: number): void {
    if (this.externalForces.length === 0) {
      return;
    }

    let totalOffsetX = 0;
    let totalOffsetY = 0;

    // Обработка всех активных сил
    for (let i = this.externalForces.length - 1; i >= 0; i--) {
      const force = this.externalForces[i];

      // Уменьшаем оставшуюся силу с учетом трения
      // Для больших сил затухание происходит медленнее
      const frictionFactor = 0.02 + (force.remainingStrength / force.initialStrength) * 0.08;
      force.remainingStrength -= force.initialStrength * frictionFactor * (delta / 16);

      // Удаляем силу, если она достаточно ослабла
      if (force.remainingStrength <= this.forceThreshold * 2) {
        this.externalForces.splice(i, 1);
        continue;
      }

      // Текущая сила относительно начальной (от 0 до 1)
      const strengthRatio = force.remainingStrength / force.initialStrength;

      // Используем функцию затухания для более плавного ослабления в конце
      // Для более сильных воздействий используем более резкое ослабление
      let currentStrength;
      if (force.initialStrength > this.forceThreshold * 10) {
        currentStrength = easeOutQuart(strengthRatio);
      } else {
        currentStrength = easeOutQuint(strengthRatio);
      }

      // Рассчитываем смещение с учетом силы и трения
      const offset = forceToTargetOffset(
        currentStrength * force.initialStrength,
        force.angle,
        force.friction
      );

      // Накапливаем смещение
      totalOffsetX += offset.x;
      totalOffsetY += offset.y;
    }

    // Применяем итоговое смещение к спрайту с учетом дельты времени
    // Делим на 16, чтобы нормализовать смещение относительно дельты (~16ms за фрейм при 60 FPS)
    this.body.x += totalOffsetX * (delta / 16);
    // this.body.y += totalOffsetY * (delta / 16);
  }

  public getDirection(): number {
    return this.direction;
  }

  public destroy(): void {
    this.debugGraphics?.destroy();
  }

  // Добавляем геттер для скорости
  public getVelocity(): Phaser.Math.Vector2 {
    return this.body.velocity;
  }

  // Добавляем геттер для максимальной скорости (используем maxVelocityX)
  public getMaxSpeed(): number {
    return this.options.maxVelocityX;
  }
}
