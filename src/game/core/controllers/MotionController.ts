import { settings } from "../../settings";
import { createLogger } from "../../../utils/logger";
import { forceToTargetOffset, easeOutQuart, easeOutQuint } from "../../utils/ForceUtils";

const logger = createLogger('MotionController');

export interface DebugSettings {
  showPositions: boolean;
  showPath: boolean;
}

interface MotionControllerOptions {
  depthOffset: number;
  debug?: DebugSettings;
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

export class MotionController {
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private options: MotionControllerOptions;

  protected moveX: number = 0;
  protected moveY: number = 0;
  protected velocityX: number = 0;     // Текущая скорость по X
  protected velocityY: number = 0;     // Текущая скорость по Y
  protected direction: number = 0;

  // Параметры для внешних сил (отдача, ветер и т.д.)
  protected externalForces: ExternalForce[] = [];
  protected defaultDecayRate: number = 0.05; // Скорость затухания (чем меньше, тем медленнее)
  protected defaultForceStrength: number = 0.15; // Сила воздействия (чем больше, тем быстрее)
  protected forceThreshold: number = 0.01; // Порог для удаления силы

  protected debugObjects: Phaser.GameObjects.GameObject[] = [];
  protected debugTexts: {[key: string]: Phaser.GameObjects.Text} = {};
  protected debugGraphics: {[key: string]: Phaser.GameObjects.Graphics} = {};

  constructor(scene: Phaser.Scene, gameObject: Phaser.Physics.Arcade.Sprite, options: MotionControllerOptions) {
    this.scene = scene;
    this.gameObject = gameObject;
    this.options = options;

    this.setupPhysics();

    if (this.options.debug) {
      this.setupDebug();
    }
  }

  private setupDebug(): void {
    this.addDebugPosition();
  } 

  // Добавляем отображение позиции
  protected addDebugPosition(): void {
    if (!this.options.debug?.showPositions) return;

    // Добавляем отладочный круг на позиции объекта
    const debugCircle = this.scene.add.circle(this.gameObject.x, this.gameObject.y, 10, 0xff0000, 0.7);
    debugCircle.setDepth(100);
    this.debugObjects.push(debugCircle);
  
    // Добавляем текст с именем объекта и координатами
    const debugText = this.scene.add.text(0, 0, ``, {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    debugText.setDepth(1000);
    this.debugObjects.push(debugText);
    this.debugTexts['position'] = debugText;
  }

  private setupPhysics(): void {
    // Базовая настройка физики
    // this.gameObject.setCollideWorldBounds(true);
  }

  // public setDepth(depth: number): void {
  //   this.gameObject.setDepth(depth);
  // }

  protected getDepth(): number {
    return this.gameObject.y + this.options.depthOffset + settings.gameplay.depthOffset;
  }

  public setMove(moveX: number, moveY: number): void {
    this.moveX = moveX;
    this.moveY = moveY;
  }

  public update(time: number, delta: number): void {
    // Обрабатываем движение с ускорением
    this.handleMovementWithAcceleration();

    // Применяем трение при движении (дополнительное замедление)
    if (Math.abs(this.velocityX) > 0 && this.options.friction > 0) {
      const frictionX = Math.min(Math.abs(this.velocityX), this.options.friction) * Math.sign(this.velocityX);
      this.velocityX -= frictionX;
    }
    
    if (Math.abs(this.velocityY) > 0 && this.options.friction > 0) {
      const frictionY = Math.min(Math.abs(this.velocityY), this.options.friction) * Math.sign(this.velocityY);
      this.velocityY -= frictionY;
    }
    
    // Обновляем движение от внешних воздействий (отдача, ветер и т.д.)
    this.updateExternalForces(delta);
    
    // Обновляем позицию игрока на основе текущей скорости
    this.gameObject.x += this.velocityX * (delta / 1000);
    this.gameObject.y += this.velocityY * (delta / 1000);
    
    // Устанавливаем позицию спрайта
    this.gameObject.setPosition(this.gameObject.x, this.gameObject.y);
    
    // Обновляем глубину отображения
    this.gameObject.setDepth(this.getDepth());
    
    if (this.options.debug) {
      this.updateDebugVisuals();
    }
  }

  private handleMovementWithAcceleration(): void {
    if (this.moveX < 0) {
      // Ускорение влево
      this.velocityX = Math.max(this.velocityX - this.options.acceleration, -this.options.maxVelocityX);
    } else if (this.moveX > 0) {
      // Ускорение вправо
      this.velocityX = Math.min(this.velocityX + this.options.acceleration, this.options.maxVelocityX);
    } else {
      // Замедление по X с инерцией
      if (this.velocityX > 0) {
        this.velocityX = Math.max(this.velocityX - this.options.deceleration, 0);
      } else if (this.velocityX < 0) {
        this.velocityX = Math.min(this.velocityX + this.options.deceleration, 0);
      }
    }
    
    // Обрабатываем движение по вертикали с ускорением
    if (this.moveY < 0) {
      // Ускорение вверх
      this.velocityY = Math.max(this.velocityY - this.options.acceleration, -this.options.maxVelocityY);
    } else if (this.moveY > 0) {
      // Ускорение вниз
      this.velocityY = Math.min(this.velocityY + this.options.acceleration, this.options.maxVelocityY);
    } else {
      // Замедление по Y с инерцией
      if (this.velocityY > 0) {
        this.velocityY = Math.max(this.velocityY - this.options.deceleration, 0);
      } else if (this.velocityY < 0) {
        this.velocityY = Math.min(this.velocityY + this.options.deceleration, 0);
      }
    }
  }
  
  // Обновляем позицию отладочных объектов
  protected updateDebugVisuals(): void {
    // Обновляем основной позиционный текст
    const positionText = this.debugTexts['position'];
    if (positionText) {
      positionText.setPosition(this.gameObject.x, this.gameObject.y - 20);
      positionText.setText(`(${Math.floor(this.gameObject.x)},${Math.floor(this.gameObject.y)}, ${Math.floor(this.gameObject.depth)})`);
    }

    // Обновляем первый дебаг-объект (круг)
    if (this.debugObjects.length > 0 && this.options.debug?.showPositions) {
      const circle = this.debugObjects[0] as Phaser.GameObjects.Arc;
      if (circle) {
        circle.setPosition(this.gameObject.x, this.gameObject.y);
      }
    }
    
    // Обновляем пути перемещения
    if (this.options.debug?.showPath) {
      const pathGraphics = this.debugGraphics['path'];
      if (pathGraphics) {
        pathGraphics.clear();
        pathGraphics.lineStyle(2, 0xff0000, 1);
        pathGraphics.lineBetween(this.gameObject.x, this.gameObject.y, this.gameObject.x + this.direction * 50, this.gameObject.y);
      }
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
    
    logger.debug(`Применена сила: угол=${angle.toFixed(2)}, сила=${force.toFixed(2)}`);
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
    this.gameObject.x += totalOffsetX * (delta / 16);
    this.gameObject.y += totalOffsetY * (delta / 16);
    
    logger.debug(`Смещение от внешних сил: (${totalOffsetX.toFixed(2)}, ${totalOffsetY.toFixed(2)})`);
  }

  public getDirection(): number {
    return this.direction;
  }

  public destroy(): void {
    // Уничтожаем отладочные объекты
    this.debugObjects.forEach(obj => obj.destroy());
    this.debugObjects = [];
    
    // Очищаем ссылки на тексты и графику
    this.debugTexts = {};
    this.debugGraphics = {};
  }
}
