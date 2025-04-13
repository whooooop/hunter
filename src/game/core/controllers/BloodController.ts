import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import { settings } from '../../settings';

const logger = createLogger('BaseBlood');

export enum BLOOD_TEXTURES {
  basic = 'blood_basic_texture',
  drops = 'blood_drops_texture',
  splatter = 'blood_splatter_texture'
}

// Интерфейс с параметрами для настройки эффекта брызг крови
export interface BloodSplashOptions {
    amount?: number;           // Количество частиц
    direction?: number;        // Направление (-10 до 10), где 0 - вертикально вверх
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
    };
    drag?: {                   // Сопротивление воздуха
        x: number;
        y: number;
    };
    rotation?: {               // Скорость вращения
        min: number;
        max: number;
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
    direction: 0,
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
        max: 25
    },
    drag: {
        x: 20,
        y: 10
    },
    rotation: {
        min: -150,
        max: 150
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

export interface BloodParticleDecalEvent {
  particle: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
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
   * @param x Координата X
   * @param y Координата Y
   * @param options Настройки эффекта брызг крови
   */
  public createBloodSplash(
      x: number, 
      y: number, 
      splashOptions?: Partial<BloodSplashOptions>
  ): void {
      if (!settings.gameplay.blood.enabled) {
          return;
      }
      // Объединяем переданные параметры с дефолтными
      const options = { ...defaultBloodOptions, ...splashOptions };

      // Создаем массив для физических брызг
      const physicsParticles: Phaser.Physics.Arcade.Sprite[] = [];
      
      // Вычисляем максимальную высоту падения для псевдо-3D
      const maxFallDistance = Phaser.Math.Between(
          options.fallDistance!.min, 
          options.fallDistance!.max
      );
      
      // Создаем новые частицы крови с физикой
      for (let i = 0; i < options.amount!; i++) {
          // Применяем разброс по высоте для начальной позиции частицы
          const heightSpread = Phaser.Math.Between(
              options.spread!.height.min,
              options.spread!.height.max
          );
          
          // Создаем композитную частицу крови с учетом настроек капель
          const bloodParticle = this.createCompositeBloodParticle(
              x,
              y + heightSpread,
              options
          );
          
          // Устанавливаем размер, вращение и прозрачность
          bloodParticle.setScale(Phaser.Math.FloatBetween(
              options.size!.min, 
              options.size!.max
          ));
          bloodParticle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
          bloodParticle.setAlpha(Phaser.Math.FloatBetween(
              options.alpha!.min, 
              options.alpha!.max
          ));
          
          // Устанавливаем глубину отображения
          bloodParticle.setDepth(options.depth!);
          
          // Отключаем стандартную коллизию с границами мира
          bloodParticle.setCollideWorldBounds(false);
          
          // Рассчитываем случайный угол разлета
          const spreadAngle = Phaser.Math.FloatBetween(
              -options.spread!.angle, 
              options.spread!.angle
          );
          const bulletAngle = (options.direction! > 0) ? 0 : Math.PI; // 0 - вправо, PI - влево
          const angle = bulletAngle + spreadAngle;
          
          // Вычисляем силу разлета
          const force = Phaser.Math.Between(
              options.speed!.min, 
              options.speed!.max
          ) * Math.min(Math.abs(options.force!), 10) / 5;
          
          // Рассчитываем компоненты скорости с учетом настроек начальной вертикальной скорости
          let vx = Math.cos(angle) * force * options.speed!.multiplier;
          const initialYVelocity = Phaser.Math.Between(
              options.initialVelocityY!.min,
              options.initialVelocityY!.max
          );
          const vy = Math.sin(angle) * force - initialYVelocity;
          
          // Применяем минимальную дистанцию разлета по X, если она задана
          // if (options.minXDistance && options.minXDistance > 0) {
          //     // Определяем направление по X
          //     const directionX = Math.sign(vx);
              
          //     // Если скорость по X ниже минимально необходимой для заданной дистанции,
          //     // корректируем её, сохраняя направление
          //     const minVxRequired = options.minXDistance * 0.2; // Коэффициент для примерного подбора скорости
          //     if (Math.abs(vx) < minVxRequired) {
          //         vx = directionX * minVxRequired;
          //     }
          // }
          
          // Применяем скорость
          bloodParticle.setVelocity(vx, vy);
          
          // Устанавливаем гравитацию
          bloodParticle.setGravityY(options.gravity!);
          
          // Добавляем вращение
          bloodParticle.setAngularVelocity(Phaser.Math.Between(
              options.rotation!.min, 
              options.rotation!.max
          ));
          
          // Настраиваем сопротивление
          bloodParticle.setDrag(options.drag!.x, options.drag!.y);
          
          // Сохраняем начальную позицию с учетом разброса по высоте
          bloodParticle.setData('initialY', y + heightSpread);
          bloodParticle.setData('maxFallDistance', maxFallDistance);
          
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
                          // Если частица упала на максимальное расстояние - останавливаем ее
                          particle.setVelocity(0, 0);
                          particle.setAngularVelocity(0);
                          particle.setGravityY(0);
                          particle.setDrag(0, 0);
                          
                          // Отключаем физику, оставляя частицу видимой
                          particle.disableBody(true, false);
                          
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
      
      logger.debug(`Создано ${options.amount} динамических частиц крови в позиции (${x}, ${y})`);
  }
  
  drawDecal(particle: Phaser.GameObjects.Sprite): void {
    const payload: BloodParticleDecalEvent = { particle, x: particle.x, y: particle.y };
    this.scene.events.emit(BloodEvents.bloodParticleDecal, payload);
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