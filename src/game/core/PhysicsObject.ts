import * as Phaser from 'phaser';
import { forceToTargetOffset, easeOutQuart, easeOutQuint } from '../utils/ForceUtils';
import { createLogger } from '../../utils/logger';

// Интерфейс для настроек отладки
export interface DebugSettings {
  enabled: boolean;
  showPositions: boolean;
  showPhysics: boolean;
  showSprites: boolean;
  logCreation: boolean;
  showPath: boolean;
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

export class PhysicsObject {
  public readonly id: string;

  protected scene: Phaser.Scene;
  protected sprite: Phaser.Physics.Arcade.Sprite;
  protected name: string = 'PhysicsObject';
  protected logger = createLogger('PhysicsObject');

  protected velocityX: number = 0;     // Текущая скорость по X
  protected velocityY: number = 0;     // Текущая скорость по Y
  protected friction: number = 0;      // Трение (замедление при движении)

  // Параметры для внешних сил (отдача, ветер и т.д.)
  protected externalForces: ExternalForce[] = [];
  
  // Настройки затухания по умолчанию
  protected defaultDecayRate: number = 0.05; // Скорость затухания (чем меньше, тем медленнее)
  protected defaultForceStrength: number = 0.15; // Сила воздействия (чем больше, тем быстрее)
  protected forceThreshold: number = 0.01; // Порог для удаления силы

  protected debugObjects: Phaser.GameObjects.GameObject[] = [];
  protected debugTexts: {[key: string]: Phaser.GameObjects.Text} = {};
  protected debugGraphics: {[key: string]: Phaser.GameObjects.Graphics} = {};

  protected x: number = 0;
  protected y: number = 0;
  protected acceleration: number = 1;
  protected deceleration: number = 0.5;
  protected direction: number = 1;

  protected moveX: number = 0;
  protected moveY: number = 0;
  protected maxVelocityX: number = 20;
  protected maxVelocityY: number = 5;

  // Настройки отладки для каждого объекта
  protected debug: DebugSettings = {
    enabled: true,
    showPositions: true,
    showPhysics: true,
    showSprites: true,
    logCreation: true,
    showPath: true
  };

  constructor(id: string, scene: Phaser.Scene, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy_placeholder');
    this.logger = createLogger(this.name);
    
    this.setupPhysics();

    // if (this.debug.enabled) {
    //   this.setupDebug();
    // }
    
    if (this.debug.logCreation) {
      this.logger.info(`Создан на позиции (${x}, ${y})`);
    }
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
  
  protected setupPhysics(): void {
    // Базовая настройка физики
    this.sprite.setCollideWorldBounds(true);
    
    // Добавляем имя объекта для отладки
    this.sprite.setName(this.name);
    
    // Делаем спрайт видимым
    if (this.debug.showSprites) {
      this.sprite.setVisible(true);
    }
    
    // Устанавливаем глубину отображения
    this.sprite.setDepth(10);
    
    // Включаем отображение тела для отладки, если включен режим отладки
    if (this.debug.showPhysics && this.scene.physics.world.drawDebug) {
      // В Phaser 3 отладка физики включается на уровне мира, а не отдельных объектов
      this.scene.physics.world.debugGraphic.visible = true;
    }
  }

  // Главный метод настройки отладки
  protected setupDebug(): void {
    // Создаем базовые элементы отладки
    this.addDebugPosition();
    
    // Добавляем отладочные линии пути, если включено
    if (this.debug.showPath) {
      this.addDebugPath();
    }
  }
  
    // Добавляем отладочные линии пути перемещения
  protected addDebugPath(): void {
    if (!this.debug.showPath) return;
    
    const lineGraphics = this.scene.add.graphics();
    lineGraphics.lineStyle(2, 0xff0000, 1);
    lineGraphics.lineBetween(this.x, this.y, this.x - 50, this.y);
    lineGraphics.setDepth(110);
    this.debugObjects.push(lineGraphics);
    this.debugGraphics['path'] = lineGraphics;
  }

  // Добавляем отображение позиции
  protected addDebugPosition(): void {
    if (!this.debug.showPositions) return;

    // Добавляем отладочный круг на позиции объекта
    const debugCircle = this.scene.add.circle(this.x, this.y, 10, 0xff0000, 0.7);
    debugCircle.setDepth(100);
    this.debugObjects.push(debugCircle);
  
    // Добавляем текст с именем объекта и координатами
    const debugText = this.scene.add.text(this.x, this.y, `${this.name} (${Math.floor(this.x)},${Math.floor(this.y)})`, {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    debugText.setDepth(100);
    this.debugObjects.push(debugText);
    this.debugTexts['position'] = debugText;
  }

  public update(time: number, delta: number): void {
    // Обрабатываем движение с ускорением
    this.handleMovementWithAcceleration();

    // Применяем трение при движении (дополнительное замедление)
    if (Math.abs(this.velocityX) > 0 && this.friction > 0) {
      const frictionX = Math.min(Math.abs(this.velocityX), this.friction) * Math.sign(this.velocityX);
      this.velocityX -= frictionX;
    }
    
    if (Math.abs(this.velocityY) > 0 && this.friction > 0) {
      const frictionY = Math.min(Math.abs(this.velocityY), this.friction) * Math.sign(this.velocityY);
      this.velocityY -= frictionY;
    }
    
    // Обновляем движение от внешних воздействий (отдача, ветер и т.д.)
    this.updateExternalForces(delta);
    
    // Обновляем позицию игрока на основе текущей скорости
    this.x += this.velocityX * (delta / 1000);
    this.y += this.velocityY * (delta / 1000);
    
    // Устанавливаем позицию спрайта
    this.sprite.setPosition(this.x, this.y);

    if (this.debug.enabled) {
      this.updateDebugVisuals();
    }
  }

  private handleMovementWithAcceleration(): void {
    if (this.moveX < 0) {
      // Ускорение влево
      this.velocityX = Math.max(this.velocityX - this.acceleration, -this.maxVelocityX);
    } else if (this.moveX > 0) {
      // Ускорение вправо
      this.velocityX = Math.min(this.velocityX + this.acceleration, this.maxVelocityX);
    } else {
      // Замедление по X с инерцией
      if (this.velocityX > 0) {
        this.velocityX = Math.max(this.velocityX - this.deceleration, 0);
      } else if (this.velocityX < 0) {
        this.velocityX = Math.min(this.velocityX + this.deceleration, 0);
      }
    }
    
    // Обрабатываем движение по вертикали с ускорением
    if (this.moveY < 0) {
      // Ускорение вверх
      this.velocityY = Math.max(this.velocityY - this.acceleration, -this.maxVelocityY);
    } else if (this.moveY > 0) {
      // Ускорение вниз
      this.velocityY = Math.min(this.velocityY + this.acceleration, this.maxVelocityY);
    } else {
      // Замедление по Y с инерцией
      if (this.velocityY > 0) {
        this.velocityY = Math.max(this.velocityY - this.deceleration, 0);
      } else if (this.velocityY < 0) {
        this.velocityY = Math.min(this.velocityY + this.deceleration, 0);
      }
    }
  }
  
  // Обновляем позицию отладочных объектов
  protected updateDebugVisuals(): void {
    // Обновляем основной позиционный текст
    const positionText = this.debugTexts['position'];
    if (positionText) {
      positionText.setPosition(this.x, this.y - 20);
      positionText.setText(`${this.name} (${Math.floor(this.x)},${Math.floor(this.y)})`);
    }

    // Обновляем первый дебаг-объект (круг)
    if (this.debugObjects.length > 0 && this.debug.showPositions) {
      const circle = this.debugObjects[0] as Phaser.GameObjects.Arc;
      if (circle) {
        circle.setPosition(this.x, this.y);
      }
    }
    
    // Обновляем пути перемещения
    if (this.debug.showPath) {
      const pathGraphics = this.debugGraphics['path'];
      if (pathGraphics) {
        pathGraphics.clear();
        pathGraphics.lineStyle(2, 0xff0000, 1);
        pathGraphics.lineBetween(this.x, this.y, this.x + this.direction * 50, this.y);
      }
    }
  }

  public destroy(): void {
    // Удаляем отладочные объекты
    this.debugObjects.forEach(obj => obj.destroy());
    
    if (this.sprite) {
      this.sprite.destroy();
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
    const targetOffset = forceToTargetOffset(force, angle, this.friction);
    
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
      friction: this.friction // Используем трение объекта
    };
    
    // Добавляем силу в список активных
    this.externalForces.push(externalForce);
    
    this.logger.debug(`Применена сила: угол=${angle.toFixed(2)}, сила=${force.toFixed(2)}`);
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
    this.x += totalOffsetX * (delta / 16);
    this.y += totalOffsetY * (delta / 16);
    
    this.logger.debug(`Смещение от внешних сил: (${totalOffsetX.toFixed(2)}, ${totalOffsetY.toFixed(2)})`);
  }
} 