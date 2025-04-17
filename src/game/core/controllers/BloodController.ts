import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import { settings } from '../../settings';
import { DecalEventPayload } from '../types/decals';
import { emitEvent } from '../Events';

const logger = createLogger('BaseBlood');

export enum BLOOD_TEXTURES {
  basic = 'blood_basic_texture',
  drops = 'blood_drops_texture',
  splatter = 'blood_splatter_texture'
}

// Интерфейс с параметрами для настройки эффекта брызг крови
export interface BloodSplashOptions {
    amount?: number;           // Количество частиц
    size?: {                   // Размер частиц
        min: number;           // Минимальный размер (масштаб)
        max: number;           // Максимальный размер (масштаб)
    };
    speed?: {                  // Скорость частиц
        min: number;           // Минимальная начальная скорость
        max: number;           // Максимальная начальная скорость
        multiplier: number;    // Множитель скорости (0-1 для замедления, >1 для ускорения)
    };
    gravity?: number;          // Сила гравитации
    spread?: {                 // Разброс частиц
        angle: number;         // Угол разброса по горизонтали (в радианах)
        height: {              // Разброс по высоте (Y-координата)
            min: number;       // Минимальный разброс по высоте
            max: number;       // Максимальный разброс по высоте
        }
    };
    initialVelocityY?: {       // Начальная вертикальная скорость
        min: number;           // Минимальное значение
        max: number;           // Максимальное значение
    };
    fallDistance?: {           // Максимальная дистанция падения
        min: number;          
        max: number;
        factor: number;
    };
    drag?: {                   // Сопротивление воздуха
        x: number;
        y: number;
    };
    alpha?: {                  // Прозрачность
        min: number;
        max: number;
    };
    force?: number;            // Сила частицы
    depth?: number;            // Приоритет отображения частиц (фиксированная глубина)
    texture?: BLOOD_TEXTURES;      // Тип текстуры ('basic', 'drops', 'splatter')
}

// Дефолтные настройки для эффекта крови
const defaultBloodOptions: BloodSplashOptions = {
    amount: 5,
    size: {
        min: 0.3,
        max: 0.7
    },
    speed: {
        min: 100,
        max: 180,
        multiplier: 0.6
    },
    gravity: 600,
    spread: {
        angle: Math.PI/7,
        height: {
            min: -5,
            max: 15
        }
    },
    initialVelocityY: {
        min: 15,
        max: 40
    },
    fallDistance: {
        min: 15,
        max: 25,
        factor: 0.5
    },
    drag: {
        x: 20,
        y: 10
    },
    alpha: {
        min: 0.6,
        max: 0.9
    },
    depth: 10,
    texture: BLOOD_TEXTURES.basic,
};

export enum BloodEvents {
  bloodParticleDecal = 'bloodParticleDecal',
}

export class BloodController {
  private scene: Phaser.Scene;
  private bloodParticles: Phaser.GameObjects.Sprite[] = [];
  
  /**
   * Конструктор системы крови
   * @param scene Сцена для размещения эффектов крови
   */
  constructor(scene: Phaser.Scene) {
      this.scene = scene;
  }

  static preload(scene: Phaser.Scene) {
    createBasicBloodTexture(scene, BLOOD_TEXTURES.basic);
    createBloodDropsTexture(scene, BLOOD_TEXTURES.drops);
    createBloodSplatterTexture(scene, BLOOD_TEXTURES.splatter);
  }
  
  /**
   * Создает композитную частицу крови с несколькими каплями
   */
  protected createCompositeBloodParticle(
      x: number,
      y: number,
      settings: BloodSplashOptions
  ): Phaser.Physics.Arcade.Sprite {
      const baseTextureKey = settings.texture || BLOOD_TEXTURES.basic;
      const bloodParticle = this.scene.physics.add.sprite(x, y, baseTextureKey);
      return bloodParticle;
  }
  
  /**
   * Добавляет частицу крови на постоянный слой декалей и удаляет оригинальный спрайт
   */
  protected addToDecalLayer(particle: Phaser.GameObjects.Sprite): void {
      // Рендерим частицу в текстуру на её текущей позиции
      this.drawDecal(particle);
      
      // Удаляем частицу из массива активных частиц
      const index = this.bloodParticles.indexOf(particle);
      if (index !== -1) {
          this.bloodParticles.splice(index, 1);
      }
      
      // Уничтожаем оригинальный спрайт частицы
      particle.destroy();
  }
  
  /**
   * Создает брызги крови в указанной позиции с настраиваемыми параметрами
   * @param x Координата X точки попадания
   * @param y Координата Y точки попадания
   * @param originPoint Координаты точки, откуда был произведен выстрел {x, y}
   * @param options Настройки эффекта брызг крови
   */
  public createBloodSplash(
      x: number, 
      y: number, 
      originPoint: { x: number, y: number },
      splashOptions?: Partial<BloodSplashOptions>
  ): void {
      if (!settings.gameplay.blood.enabled) {
          return;
      }
      // Объединяем переданные параметры с дефолтными
      const options = { ...defaultBloodOptions, ...splashOptions };

      // Вычисляем базовый угол на основе originPoint и hitPoint (x, y)
      const baseAngle = Math.atan2(y - originPoint.y, x - originPoint.x);

      // --- Расчет модификатора угла разброса --- 
      // Берем абсолютный угол от горизонтали (0 до PI)
      const absBaseAngle = Math.abs(baseAngle);
      // Максимальное увеличение угла для строго вертикального попадания (90 градусов = PI/2)
      const maxSpreadIncreaseFactor = 1.8; // Увеличиваем разброс почти в 2 раза при вертикальном попадании
      // Интерполируем коэффициент от 1 (горизонтально) до maxSpreadIncreaseFactor (вертикально)
      // Используем (PI/2 - absBaseAngle) / (PI/2) для получения значения от 0 (вертикально) до 1 (горизонтально), но нам нужен обратный эффект
      // Используем absBaseAngle / (Math.PI / 2) для получения значения от 0 (горизонтально) до 1 (вертикально)
      // Чтобы получить множитель от 1 до max, используем: 1 + (1 - abs(угол)/(PI/2)) * (max - 1) - не совсем то
      // Проще: 1 + (вертикальность) * (макс_увеличение - 1)
      // Вертикальность = 1 - (absBaseAngle / (Math.PI / 2)) ? Нет, наоборот.
      // Вертикальность = abs( PI/2 - absBaseAngle ) / (PI/2) - значение от 0 (вертикально) до 1 (горизонтально) ? Тоже нет
      // Синус может подойти: sin(absBaseAngle) дает 0 для горизонтали и 1 для вертикали
      const verticalityFactor = Math.sin(absBaseAngle); // 0 для горизонтали, 1 для вертикали
      const spreadAngleMultiplier = 1 + verticalityFactor * (maxSpreadIncreaseFactor - 1);
      // Применяем модификатор к углу разброса из настроек
      const effectiveSpreadAngle = options.spread!.angle * spreadAngleMultiplier;
      // --- Конец расчета модификатора --- 
      
      // Создаем массив для физических брызг
      const physicsParticles: Phaser.Physics.Arcade.Sprite[] = [];
      
      // Создаем новые частицы крови с физикой
      for (let i = 0; i < options.amount!; i++) {
          // Применяем разброс по высоте для начальной позиции частицы
          const heightSpread = Phaser.Math.Between(
              options.spread!.height.min,
              options.spread!.height.max
          );
          
          // Создаем композитную частицу крови
          const bloodParticle = this.createCompositeBloodParticle(
              x,
              y + heightSpread,
              options
          );
          
          // Устанавливаем размер, вращение и прозрачность
          bloodParticle.setScale(Phaser.Math.FloatBetween(options.size!.min, options.size!.max));
          bloodParticle.setAlpha(Phaser.Math.FloatBetween(options.alpha!.min, options.alpha!.max));
          bloodParticle.setDepth(options.depth!);
          bloodParticle.setCollideWorldBounds(false);
          
          // Рассчитываем угол
          const spreadAngleOffset = Phaser.Math.FloatBetween(
              -options.spread!.angle, 
              options.spread!.angle
          );
          const angle = baseAngle + spreadAngleOffset;
          
          // Рассчитываем силу
          const force = Phaser.Math.Between(
              options.speed!.min, 
              options.speed!.max
          ) * Math.min(Math.abs(options.force || 1), 10) / 5;
          
          // Рассчитываем НАЧАЛЬНУЮ ВЕРТИКАЛЬНУЮ СКОРОСТЬ
          const initialYVelocity = Phaser.Math.Between(
              options.initialVelocityY!.min,
              options.initialVelocityY!.max
          );
          
          // Рассчитываем компоненты скорости
          const vx = Math.cos(angle) * force * options.speed!.multiplier;
          const vy = Math.sin(angle) * force - initialYVelocity; // Обратите внимание на минус
          
          // --- Расчет maxFallDistance на основе initialYVelocity --- 
          let maxFallDistance = Phaser.Math.Between(
              options.fallDistance!.min, 
              options.fallDistance!.max
          );
          // Коэффициент влияния начальной скорости на дистанцию падения (подбирается экспериментально)
          // если initialYVelocity < 0 (летит вверх), maxFallDistance УМЕНЬШАЕТСЯ
          // если initialYVelocity > 0 (летит вниз), maxFallDistance УВЕЛИЧИВАЕТСЯ
          maxFallDistance += initialYVelocity * options.fallDistance!.factor;
          // Ограничиваем минимальное/максимальное значение, чтобы не улетело слишком далеко
          maxFallDistance = Phaser.Math.Clamp(maxFallDistance, 5, 500); // Примерные границы
          // --- Конец расчета maxFallDistance ---

          // Применяем скорость
          bloodParticle.setVelocity(vx, vy);
          
          // Устанавливаем гравитацию
          bloodParticle.setGravityY(options.gravity!);
          
          // Настраиваем сопротивление
          // bloodParticle.setDrag(options.drag!.x, options.drag!.y);
          
          // Сохраняем данные для псевдо-3D
          bloodParticle.setData('initialY', y + heightSpread);
          bloodParticle.setData('maxFallDistance', maxFallDistance); // Используем рассчитанное значение
          
          // Добавляем в массив частиц
          this.bloodParticles.push(bloodParticle);
          physicsParticles.push(bloodParticle);
      }
      
      // Настраиваем обработку движения и остановки частиц для псевдо-3D
      const particleUpdateEvent = this.scene.time.addEvent({
          delay: 10, // Обновление для плавного движения
          callback: () => {
              let allStopped = true;
              
              physicsParticles.forEach(particle => {
                  if (particle.active) {
                      // Получаем сохраненные данные
                      const initialY = particle.getData('initialY') as number;
                      const maxFallDistance = particle.getData('maxFallDistance') as number;
                      
                      // Проверяем, не превысили ли мы максимальную дистанцию падения для псевдо-3D
                      if (particle.y >= initialY + maxFallDistance) {
                          // Добавляем частицу на слой декалей и удаляем её
                          this.addToDecalLayer(particle);
                      } else {
                          // Умеренное ускорение падения по мере движения
                          if (particle.body && particle.body.velocity.y < 200) {
                              particle.body.velocity.y += 10;
                          }
                          
                          // Умеренное замедление горизонтального движения
                          if (particle.body && Math.abs(particle.body.velocity.x) > 15) {
                              particle.body.velocity.x *= 0.95;
                          }
                          
                          allStopped = false;
                      }
                  }
              });
              
              // Если все частицы остановились, отключаем обновление
              if (allStopped) {
                  particleUpdateEvent.destroy();
              }
          },
          callbackScope: this,
          loop: true
      });
  }
  
  drawDecal(particle: Phaser.GameObjects.Sprite): void {
    emitEvent(this.scene, BloodEvents.bloodParticleDecal, { particle, x: particle.x, y: particle.y });
  }
}

/**
 * Создает базовую текстуру для капель крови
 */
export function createBasicBloodTexture(scene: Phaser.Scene, textureKey: string): void {
  if (scene.textures.exists(textureKey)) {
      return;
  }
  
  // Создаем графику для рисования частицы крови
  const graphics = scene.add.graphics();
  
  // Цвета для крови
  const darkRed = 0x8B0000;
  const brightRed = 0xFF0000;
  
  // Рисуем базовую каплю крови
  graphics.fillStyle(brightRed, 0.9);
  graphics.fillCircle(4, 4, 3);
  
  // Создаем текстуру из графики
  graphics.generateTexture(textureKey, 8, 8);
  
  // Удаляем графику после создания текстуры
  graphics.destroy();
}

/**
 * Создает текстуру с несколькими каплями крови
 */
export function createBloodDropsTexture(scene: Phaser.Scene, textureKey: string): void {
  if (scene.textures.exists(textureKey)) {
      return;
  }
  
  // Создаем графику для рисования частицы крови с каплями
  const graphics = scene.add.graphics();
  
  // Цвета для крови
  const darkRed = 0x8B0000;
  const brightRed = 0xFF0000;
  
  // Рисуем основную каплю
  graphics.fillStyle(brightRed, 0.9);
  graphics.fillCircle(8, 8, 4);
  
  // Рисуем дополнительные маленькие капли
  graphics.fillCircle(14, 6, 2);
  graphics.fillCircle(4, 10, 2.5);
  graphics.fillCircle(12, 12, 1.5);
  
  // Добавляем темные участки для объема
  graphics.fillStyle(darkRed, 0.8);
  graphics.fillCircle(7, 7, 2);
  
  // Создаем текстуру из графики
  graphics.generateTexture(textureKey, 20, 20);
  
  // Удаляем графику после создания текстуры
  graphics.destroy();
}

/**
 * Создает текстуру брызг крови с пятнами
 */
export function createBloodSplatterTexture(scene: Phaser.Scene, textureKey: string): void {
  if (scene.textures.exists(textureKey)) {
      return;
  }
  
  // Создаем графику для рисования брызг
  const graphics = scene.add.graphics();
  
  // Цвета для крови
  const darkRed = 0x8B0000;
  const brightRed = 0xFF0000;
  
  // Рисуем большое центральное пятно
  graphics.fillStyle(brightRed, 0.85);
  graphics.fillCircle(15, 15, 8);
  
  // Добавляем брызги в разные стороны
  graphics.fillStyle(brightRed, 0.7);
  
  // Брызги в разных направлениях
  for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const distance = Phaser.Math.Between(8, 15);
      const x = 15 + Math.cos(angle) * distance;
      const y = 15 + Math.sin(angle) * distance;
      const size = Phaser.Math.FloatBetween(1, 4);
      graphics.fillCircle(x, y, size);
  }
  
  // Добавляем темные участки для объема
  graphics.fillStyle(darkRed, 0.8);
  graphics.fillCircle(13, 13, 4);
  
  // Создаем текстуру из графики
  graphics.generateTexture(textureKey, 30, 30);
  
  // Удаляем графику после создания текстуры
  graphics.destroy();
}

export function createSimpleBloodConfig(multiplier: number): BloodSplashOptions {
  return {
    amount: Phaser.Math.Between(50, 100) * multiplier,
    force: 20 * multiplier,
    size: {
      min: 0.2,
      max: 0.3
    },
    speed: {
      min: 500,
      max: 1080,
      multiplier: 0.6
    },
    gravity: 700,
    spread: {
      angle: Math.PI/14,
      height: {
        min: -3, // Разброс вверх от точки попадания
        max: 2   // Разброс вниз от точки попадания
      }
    },
    fallDistance: {
      min: 1,
      max: 15,
      factor: 0.5 * multiplier
    },
  }
}