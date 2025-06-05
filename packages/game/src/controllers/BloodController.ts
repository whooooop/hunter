import * as Phaser from 'phaser';
import { emitEvent, onEvent } from '../GameEvents';
import { SettingsService } from '../services/SettingsService';
import { Blood, Decals, Location } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('BaseBlood');

// --- ДОБАВЬ КЛЮЧ ТЕКСТУРЫ ---
const VIGNETTE_TEXTURE_KEY = 'vignette_texture'; // Ключ для загруженной текстуры виньетки

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
    angle: Math.PI / 7,
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
  private bloodParticles: Phaser.GameObjects.Sprite[] = [];
  private bloodPools: Phaser.GameObjects.Container[] = [];
  private settingsService: SettingsService;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: Location.Bounds
  ) {
    this.settingsService = SettingsService.getInstance();

    // setTimeout(() => {
    //   this.createBloodPool(300, 300, 50);
    // }, 3000)

    if (this.settingsService.getValue('bloodEnabled')) {
      onEvent(this.scene, Blood.Events.BloodSplash.Local, this.createBloodSplash, this);
      onEvent(this.scene, Blood.Events.ScreenBloodSplash.Local, this.createScreenBloodSplash, this);
      onEvent(this.scene, Blood.Events.DeathFountain.Local, this.createDeathFountain, this);
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
    // Объединяем переданные параметры с дефолтными
    const options = { ...defaultBloodOptions, ...config };

    // Вычисляем базовый угол на основе originPoint и hitPoint (x, y)
    const baseAngle = Math.atan2(y - originPoint.y, x - originPoint.x);

    // Создаем массив для физических брызг
    const physicsParticles: Phaser.Physics.Arcade.Sprite[] = [];

    // Создаем новые частицы крови с физикой
    for (let i = 0; i < options.amount!; i++) {
      // Создаем композитную частицу крови
      const bloodParticle = this.createCompositeBloodParticle(
        x,
        y,
        options
      );

      // Устанавливаем размер и прозрачность
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
      bloodParticle.setData('initialY', y);
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

  /**
   * Создает эффект фонтана крови при смерти врага
   */
  public createDeathFountain({ x, y, config }: Blood.Events.DeathFountain.Payload): void {
    // Дефолтные настройки для фонтана смерти
    const defaultConfig: Blood.DeathFountainConfig = {
      particleCount: 50,
      gravity: 1200,
      speed: { min: 350, max: 750 },
      angles: {
        fountain: { min: -110, max: -40 },
        sides: { min: -25, max: 25 }
      },
      fountainRatio: 0.75,
      scale: { min: 0.1, max: 0.35 },
      groundVariation: 40,
      randomness: { x: 8, y: 60 },
      texture: Blood.Texture.drops
    };

    const settings = { ...defaultConfig, ...config };

    // Создаем массив спрайтов с реальной гравитацией
    const particles: Phaser.GameObjects.Sprite[] = [];

    for (let i = 0; i < settings.particleCount!; i++) {
      // Создаем спрайт частицы НА УРОВНЕ ЗЕМЛИ (центр врага)
      const particle = this.scene.add.sprite(x, y, settings.texture!);
      particle.setDepth(1000 + i);
      particle.setScale(Phaser.Math.FloatBetween(settings.scale!.min, settings.scale!.max));
      particle.setTint(Phaser.Math.RND.pick([0xFF0000, 0x8B0000, 0xA52A2A, 0x654321]));

      // ФОНТАН КРОВИ: хорошая ширина + больше высоты
      let angle;
      if (i < settings.particleCount! * settings.fountainRatio!) {
        // 75% частиц летят вверх (более высокий фонтан)
        angle = Phaser.Math.FloatBetween(settings.angles!.fountain.min, settings.angles!.fountain.max) * Math.PI / 180;
      } else {
        // 25% частиц летят в стороны (сохраняем хорошую ширину)
        angle = Phaser.Math.FloatBetween(settings.angles!.sides.min, settings.angles!.sides.max) * Math.PI / 180;
      }

      // УВЕЛИЧЕННАЯ скорость для большей высоты
      const speed = Phaser.Math.FloatBetween(settings.speed!.min, settings.speed!.max);
      const initialVelocityX = Math.cos(angle) * speed;
      const initialVelocityY = Math.sin(angle) * speed;

      // Рассчитываем точку приземления для этой частицы
      // ПРАВИЛЬНАЯ формула с учетом времени полета
      const timeToLand = Math.abs(2 * initialVelocityY / settings.gravity!);
      const landingX = particle.x + (initialVelocityX * timeToLand) + Phaser.Math.FloatBetween(-settings.randomness!.x, settings.randomness!.x);

      // ПСЕВДО-3D: высота земли зависит от направления полета
      // Частицы летящие вверх по экрану приземляются "дальше" (выше по Y)
      // Частицы летящие вниз по экрану приземляются "ближе" (ниже по Y)
      const baseGroundLevel = y; // Уровень земли врага
      const directionY = Math.sin(angle); // -1 (вверх) до +1 (вниз)
      let landingY = baseGroundLevel + (directionY * settings.groundVariation!) + Phaser.Math.FloatBetween(-settings.randomness!.y, settings.randomness!.y);

      if (landingY < this.bounds.top) {
        landingY = this.bounds.top + (this.bounds.top - landingY);
      }

      // УБИРАЕМ искусственное ограничение дистанции - пусть частицы летят естественно
      const finalLandingX = landingX;
      const finalLandingY = landingY;
      const finalTimeToLand = timeToLand;

      // Сохраняем данные частицы с гравитацией
      particle.setData('velocityX', initialVelocityX);
      particle.setData('velocityY', initialVelocityY);
      particle.setData('currentVelocityX', initialVelocityX);
      particle.setData('currentVelocityY', initialVelocityY);
      particle.setData('startX', particle.x);
      particle.setData('startY', particle.y);
      particle.setData('landingX', finalLandingX);
      particle.setData('landingY', finalLandingY);
      particle.setData('timeToLand', finalTimeToLand * 1000); // Переводим в миллисекунды
      particle.setData('startTime', this.scene.time.now);
      particle.setData('landed', false);
      particle.setData('gravity', settings.gravity!);

      particles.push(particle);
    }

    // Создаем обновление с реальной гравитацией
    const updateParticles = () => {
      const currentTime = this.scene.time.now;
      const deltaTime = 16 / 1000; // ~60 FPS в секундах
      let activeParticles = 0;

      particles.forEach(particle => {
        if (!particle.active || particle.getData('landed')) return;

        const startTime = particle.getData('startTime');
        const timeToLand = particle.getData('timeToLand');
        const elapsed = currentTime - startTime;

        // Проверяем достигли ли времени приземления
        if (elapsed >= timeToLand) {
          // Частица приземлилась
          particle.setData('landed', true);

          // Перемещаем на точку приземления
          const landingX = particle.getData('landingX');
          const landingY = particle.getData('landingY');
          particle.setPosition(landingX, landingY);

          // Добавляем частицу в слой декалей
          this.addToDecalLayer(particle);
          return;
        }

        activeParticles++;

        // Обновляем позицию с реальной гравитацией
        let currentVelocityX = particle.getData('currentVelocityX');
        let currentVelocityY = particle.getData('currentVelocityY');
        const gravity = particle.getData('gravity');

        // Применяем гравитацию к вертикальной скорости
        currentVelocityY += gravity * deltaTime;

        // Обновляем позицию
        const newX = particle.x + currentVelocityX * deltaTime;
        const newY = particle.y + currentVelocityY * deltaTime;

        particle.setPosition(newX, newY);

        // Сохраняем новые скорости
        particle.setData('currentVelocityX', currentVelocityX);
        particle.setData('currentVelocityY', currentVelocityY);

        // Немного поворачиваем частицу
        particle.setRotation(particle.rotation + 0.05);

        // Проверяем не упала ли частица ниже точки приземления
        const landingY = particle.getData('landingY');
        const particleVelocityY = particle.getData('currentVelocityY');

        // Для частиц летящих вниз: останавливаем когда достигли точки приземления
        // Для частиц летящих вверх: останавливаем когда упали обратно до точки приземления
        const shouldLand = (particleVelocityY > 0 && particle.y >= landingY) || // Падает вниз и достигла земли
          (particle.y >= landingY && particle.y > particle.getData('startY')); // Или уже ниже стартовой точки

        if (shouldLand) {
          // Принудительно приземляем
          particle.setData('landed', true);
          particle.setPosition(particle.getData('landingX'), landingY);

          this.addToDecalLayer(particle);
        }
      });

      // Если все частицы приземлились, останавливаем обновление
      if (activeParticles === 0) {
        updateEvent.destroy();
      }
    };

    // Запускаем цикл обновления
    const updateEvent = this.scene.time.addEvent({
      delay: 16, // ~60 FPS
      callback: updateParticles,
      loop: true
    });
  }

  drawDecal(particle: Phaser.GameObjects.Sprite): void {
    emitEvent(this.scene, Decals.Events.Local, { object: particle, x: particle.x, y: particle.y, type: 'blood' });
  }

  /**
   * Создает анимированную лужу крови
   * @param x Центральная точка X
   * @param y Центральная точка Y
   * @param size Примерный размер лужи
   */
  public createBloodPool(x: number, y: number, size: number): void {
    if (!this.settingsService.getValue('bloodEnabled')) return;

    const poolContainer = this.scene.add.container(x, y);
    poolContainer.setDepth(5);

    const colors = [0x8B0000, 0x800000, 0xDC143C];

    // Основной слой
    const mainPool = this.scene.add.graphics();
    poolContainer.add(mainPool);

    // Дополнительные языки
    const tongues: Phaser.GameObjects.Graphics[] = [];
    const tonguesCount = Phaser.Math.Between(5, 8);
    for (let i = 0; i < tonguesCount; i++) {
      const tongue = this.scene.add.graphics();
      poolContainer.add(tongue);
      tongues.push(tongue);
    }

    // Второй слой (полупрозрачный)
    const underPool = this.scene.add.graphics();
    poolContainer.addAt(underPool, 0);

    let progress = 0;
    this.scene.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: 1000,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        progress = tween.getValue();

        // Второй слой — чуть больше и прозрачнее
        underPool.clear();
        underPool.fillStyle(colors[1], 0.25);
        underPool.fillEllipse(0, 0, size * 1.15 * progress, size * 0.55 * progress);

        // Основной эллипс
        mainPool.clear();
        mainPool.fillStyle(colors[0], 0.8);
        mainPool.fillEllipse(0, 0, size * progress, size * 0.45 * progress);

        // // Языки
        // tongues.forEach((tongue, i) => {
        //   // tongue.clear();
        //   const angle = (Math.PI * 2 / tonguesCount) * i + Phaser.Math.FloatBetween(-0.2, 0.2);
        //   const r = (size * 0.5 + Phaser.Math.Between(8, 18)) * (progress);
        //   const px = Math.cos(angle) * r;
        //   const py = Math.sin(angle) * r * 0.45;
        //   const tongueLen = Phaser.Math.Between(10, 22) * (1 - progress);
        //   const tongueWidth = Phaser.Math.Between(6, 12) * (1 - progress);
        //   tongue.fillStyle(colors[Phaser.Math.Between(0, colors.length - 1)], 0.7);
        //   tongue.fillEllipse(px, py, tongueLen, tongueWidth);
        // });
      }
    });

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
    // texture: Blood.Texture.drops,
    amount: Phaser.Math.Between(40, 60) * multiplier,
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
      angle: Math.PI / 14,
    },
    fallDistance: {
      min: 1,
      max: 15,
      factor: 0.5 * multiplier
    },
  }
}