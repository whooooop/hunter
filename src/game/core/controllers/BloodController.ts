import * as Phaser from 'phaser';
import { createLogger } from '../../../utils/logger';
import { settings } from '../../settings';
import { Decals } from '../types/decals';
import { emitEvent, onEvent } from '../Events';
import { Blood } from '../types/BloodTypes';

const logger = createLogger('BaseBlood');

// --- ДОБАВЬ КЛЮЧ ТЕКСТУРЫ ---
const VIGNETTE_TEXTURE_KEY = 'vignette_texture'; // Ключ для загруженной текстуры виньетки
const pause = 1;

// Дефолтные настройки для эффекта крови
const defaultBloodOptions: Partial<Blood.BloodSplashConfig> = {
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
    texture: Blood.Texture.basic,
};

// Интерфейс для опций эффекта крови на экране


// Дефолтные настройки для крови на экране
const defaultScreenBloodOptions: Blood.ScreenBloodSplashConfig = {
    amount: Phaser.Math.Between(8, 15),
    duration: Phaser.Math.Between(1500, 3000),
    alpha: { min: 0.6, max: 0.9 },
    scale: { min: 0.4, max: 1.2 },
    dripChance: 0.3, // 30% брызг будут стекать
    dripDistance: { min: 50, max: 200 },
    showVignette: true,
    vignetteAlpha: 0.25,
    vignetteDepth: 9000,  // Глубоко, но ниже брызг
    splashesDepth: 9001, // Брызги поверх рамки
};

export class BloodController {
  private scene: Phaser.Scene;
  private bloodParticles: Phaser.GameObjects.Sprite[] = [];
  
  constructor(scene: Phaser.Scene) {
      this.scene = scene;

      if (settings.gameplay.blood.enabled) {
        onEvent(this.scene, Blood.Events.BloodSplash.Local, this.createBloodSplash, this);
        onEvent(this.scene, Blood.Events.ScreenBloodSplash.Local, this.createScreenBloodSplash, this);
      }
  }

  static preload(scene: Phaser.Scene) {
    createBasicBloodTexture(scene, Blood.Texture.basic);
    createBloodDropsTexture(scene, Blood.Texture.drops);
    createBloodSplatterTexture(scene, Blood.Texture.splatter);
  }
  
  protected createCompositeBloodParticle(
      x: number,
      y: number,
      settings: Blood.BloodSplashConfig
  ): Phaser.Physics.Arcade.Sprite {
      const baseTextureKey = settings.texture || Blood.Texture.basic;
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
   */
  public createBloodSplash(
      { x, y, originPoint, config }: Blood.Events.BloodSplash.Payload
  ): void {
      if (!settings.gameplay.blood.enabled) {
          return;
      }
      // Объединяем переданные параметры с дефолтными
      const options = { ...defaultBloodOptions, ...config };

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
  
  /**
   * Создает эффект брызг крови "на экране" (камере).
   * @param options Настройки эффекта
   */
  public createScreenBloodSplash(payload: Blood.Events.ScreenBloodSplash.Payload): void {
    const config = { ...defaultScreenBloodOptions, ...payload.config };

    const camera = this.scene.cameras.main;
    const screenWidth = camera.width;
    const screenHeight = camera.height;

    // --- Создание Виньетки из Текстуры ---
    let vignetteImage: Phaser.GameObjects.Image | null = null; 
    if (config.showVignette && this.scene.textures.exists(VIGNETTE_TEXTURE_KEY)) {
        // 1. Создаем Image с текстурой виньетки
        vignetteImage = this.scene.add.image(
            screenWidth / 2,
            screenHeight / 2,
            VIGNETTE_TEXTURE_KEY
        );
        vignetteImage.setScrollFactor(0);
        vignetteImage.setDepth(config.vignetteDepth!); 
        vignetteImage.setDisplaySize(screenWidth, screenHeight);
        vignetteImage.setAlpha(0); 

        // 2. Анимация появления/исчезновения (анимируем альфу)
        const currentVignette = vignetteImage; 
        this.scene.tweens.add({ 
            targets: currentVignette,
            alpha: config.vignetteAlpha!, 
            duration: config.duration! * 0.1,
            ease: 'Quad.easeOut',
            yoyo: true,
            hold: config.duration! * 0.8,
            onComplete: () => {
                currentVignette?.destroy();
            }
        });
    } else if (config.showVignette) {
        console.warn(`Vignette texture '${VIGNETTE_TEXTURE_KEY}' not found. Skipping vignette effect.`);
    }
    // --- Конец создания виньетки из Текстуры ---

    // --- Создание Брызг ---
    const screenBloodContainer = this.scene.add.container(0, 0); 
    screenBloodContainer.setScrollFactor(0);
    screenBloodContainer.setDepth(config.splashesDepth!); 

    for (let i = 0; i < config.amount!; i++) { 
        // Случайная позиция на экране
        const x = Phaser.Math.Between(0, screenWidth);
        const y = Phaser.Math.Between(0, screenHeight);

        // Случайный масштаб и угол
        const scale = Phaser.Math.FloatBetween(config.scale!.min, config.scale!.max);
        const angle = Phaser.Math.Between(0, 360);
        const alpha = Phaser.Math.FloatBetween(config.alpha!.min, config.alpha!.max);

        // Создаем спрайт брызга
        const splash = this.scene.add.sprite(x, y, Blood.Texture.splatter); // Используем текстуру брызг
        splash.setOrigin(0.5);
        splash.setScale(scale);
        splash.setAngle(angle);
        splash.setAlpha(alpha);

        screenBloodContainer.add(splash);

        // Анимация исчезновения для всех брызг
        this.scene.tweens.add({
            targets: splash,
            alpha: 0,
            duration: config.duration!, // Используем ! т.к. есть дефолтное значение
            ease: 'Quad.easeIn', // Замедленное исчезновение
            delay: Phaser.Math.Between(0, config.duration! * 0.1), // Небольшая случайная задержка
            onComplete: () => {
                splash.destroy(); // Уничтожаем брызг после исчезновения
            }
        });

        // Анимация стекания для некоторых брызг
        if (Math.random() < config.dripChance!) { // Используем ! т.к. есть дефолтное значение
            const dripDist = Phaser.Math.Between(config.dripDistance!.min, config.dripDistance!.max);
            this.scene.tweens.add({
                targets: splash,
                y: splash.y + dripDist, // Двигаем вниз
                duration: config.duration! * Phaser.Math.FloatBetween(0.8, 1.2), // Немного разная скорость стекания
                ease: 'Sine.easeIn' // Имитация ускорения
            });
        }
    }

    // --- Уничтожение контейнера ---
     const currentContainer = screenBloodContainer;
     this.scene.time.delayedCall(config.duration! * 1.2, () => {
        currentContainer?.destroy();
    });
  }

  drawDecal(particle: Phaser.GameObjects.Sprite): void {
    emitEvent(this.scene, Decals.Events.Local, { object: particle, x: particle.x, y: particle.y, type: 'blood' });
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

export function createSimpleBloodConfig(multiplier: number): Partial<Blood.BloodSplashConfig> {
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