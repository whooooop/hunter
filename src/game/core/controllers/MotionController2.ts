import { settings } from "../../settings";
import { createLogger } from "../../../utils/logger";
import { forceToTargetOffset, easeOutQuart, easeOutQuint } from "../../utils/ForceUtils";
import { LocationBounds } from "../BaseLocation";
import { hexToNumber } from "../../utils/colors";

const logger = createLogger('MotionController');

interface MotionControllerOptions {
  depthOffset?: number;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  friction: number;
  direction: number;
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

  private locationBounds: LocationBounds | null = null;

  // Параметры для внешних сил (отдача, ветер и т.д.)
  protected externalForces: ExternalForce[] = [];
  protected defaultDecayRate: number = 0.05; // Скорость затухания (чем меньше, тем медленнее)
  protected defaultForceStrength: number = 0.15; // Сила воздействия (чем больше, тем быстрее)
  protected forceThreshold: number = 0.01; // Порог для удаления силы

  private debug: boolean = false;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private debugRect!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, body: Phaser.Physics.Arcade.Body, options: MotionControllerOptions) {
    this.scene = scene;
    this.body = body;
    this.options = options;

    // Настраиваем физические свойства тела
    if (this.body) {
        this.body.setDrag(this.options.friction); // Используем friction как drag
        this.body.setMaxVelocity(this.options.maxVelocityX, this.options.maxVelocityY);
    }

    if (this.debug) {
      this.debugGraphics = scene.add.graphics();
      this.debugRect = scene.add.rectangle(this.body.x, this.body.y, this.body.width, this.body.height, 0x0000ff, 0.5);
    }
  }


  public isMoving(): boolean {
    return this.moveX !== 0 || this.moveY !== 0;
  }

  public isJumping(): boolean {
    return this.jumping;
  }

  public getDepth(): number {
    const depthOffset = this.options.depthOffset || 0;
    return this.body.y + (this.body.height / 2) + depthOffset + settings.gameplay.depthOffset - this.jumpOffsetY;
  }

  public setMove(moveX: number, moveY: number): void {
    this.moveX = moveX;
    this.moveY = moveY;

    if (!this.body) return;

    // Нормализуем вектор направления, чтобы диагональное движение не было быстрее
    const moveVector = new Phaser.Math.Vector2(moveX, moveY).normalize();

    // Устанавливаем ускорение на физическое тело
    // Если moveX/moveY = 0, ускорение будет 0, и drag замедлит объект
    this.body.setAcceleration(moveVector.x * this.options.acceleration, moveVector.y * this.options.acceleration);
    
    // Сохраняем направление для других нужд (например, оружие)
    if (moveX < 0) {
        this.direction = -1;
    } else if (moveX > 0) {
        this.direction = 1;
    } else {
        // Если движение по X прекратилось, сохраняем последнее направление
        // this.direction остается прежним
    }
  }

  public update(time: number, delta: number): void {
    // Ускорение и максимальная скорость теперь обрабатываются физикой через setMove
    this.handleJump(time, delta);

    // Обновляем движение от внешних воздействий (отдача, ветер и т.д.) - все еще меняет позицию напрямую
    this.updateExternalForces(delta);
    
    // Если прыгаем, устанавливаем Y на основе jumpStartY и jumpOffsetY, переписывая физику
    if (this.jumping) {
      this.body.y = this.jumpStartY + this.jumpOffsetY;
    }
    if (this.locationBounds) {
      const halfWidth = this.body.width / 2;
      const halfHeight = this.body.height / 2;
      this.body.x = Math.max(this.locationBounds.left + halfWidth, Math.min(this.locationBounds.right - halfWidth, this.body.x));
      if (!this.jumping) {
        this.body.y = Math.max(this.locationBounds.top + halfHeight, Math.min(this.locationBounds.bottom - halfHeight, this.body.y));
      }
    }

    if (this.debugGraphics) {
      this.debugGraphics.clear();
      this.debugGraphics.setDepth(1000);
      this.debugGraphics.fillStyle(hexToNumber('#d23a3a'));
      this.debugGraphics.fillRect(this.body.x - this.body.width / 2, this.getDepth(), this.body.width, 1);

      this.debugGraphics.lineStyle(2, hexToNumber('#fbb52f'), 1);
      this.debugGraphics.strokeRect(this.body.x - this.body.width / 2, this.body.y - this.body.height / 2, this.body.width, this.body.height);
    }
  }

  public getPosition(): { x: number, y: number, jumpHeight: number, depth: number } {
    return {
      x: this.body.x,
      y: this.body.y,
      jumpHeight: this.jumpOffsetY,
      depth: this.getDepth(),
    };
  }

  public setLocationBounds(bounds: LocationBounds): void {
    this.locationBounds = bounds;
  }

  public jump(height: number = 100, duration: number = 500): void {
    if (this.jumping) return;
    this.startJumpTime = this.scene.time.now;
    this.jumpHeight = height;
    this.jumpDuration = duration;
    this.jumpOffsetY = 0;
    this.jumpStartY = this.body.y;
    this.jumping = true;
  }

  /**
   * Обрабатывает логику прыжка
   */
  private handleJump(time: number, delta: number): void {
    if (!this.jumping) return;
    
    const jumpProgress = Math.min((time - this.startJumpTime) / this.jumpDuration, 1);
    this.jumpOffsetY = -1 * this.jumpHeight * Math.sin(Math.PI * jumpProgress);

    if (jumpProgress >= 1) {
      this.jumping = false;
      this.jumpOffsetY = 0;
      this.body.y = this.jumpStartY;
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
