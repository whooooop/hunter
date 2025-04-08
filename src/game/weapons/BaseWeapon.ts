import * as Phaser from 'phaser';
import { BaseBullet } from './BaseBullet';
import { GameplayScene } from '../scenes/GameplayScene';
import { Player } from '../entities/Player';
import { settings } from '../settings';
import { createLogger } from '../../utils/logger';
import { ShellCasing } from '../entities/ShellCasing';

const logger = createLogger('BaseWeapon');

interface BaseWeaponOptions {
  // Перезарядка
  reloadTime: number; // Скорость перезарядки в мс
  magazineSize: number; // Размер магазина

  // Патроны
  damage: number;       // Урон от одного выстрела
  speed: number;       // Скорость пули

  // Параметры стрельбы
  fireRate: number; // Задержка между выстрелами в мс
  spreadAngle: number; // Угол разброса при выстреле в градусах
  aimingTime: number; // Время прицеливания в секундах
  range: number; // Дистанция стрельбы
  automatic: boolean; // Является ли оружие автоматическим
  
  // Параметры отдачи
  recoilForce: number; // Сила отдачи
  recoilRecovery: number; // Скорость восстановления от отдачи

  // Звуки
  emptySoundPath?: string;
  reloadSoundPath?: string;
  fireSoundPath?: string;

  bulletClass: typeof BaseBullet;
}

type AudioAssets = {
  fire: Phaser.Sound.BaseSound | null;
  empty: Phaser.Sound.BaseSound | null;
  reload: Phaser.Sound.BaseSound | null;
}

export class BaseWeapon {
  protected id: string = 'unknown_weapon';

  protected scene: Phaser.Scene;
  protected player: Player;
  protected sprite: Phaser.GameObjects.Sprite | null = null;
  
  protected lastFired: number = 0;
  protected isReloading: boolean = false;
  protected currentAmmo: number;
  protected currentRecoil: number = 0;
  protected canFireAgain: boolean = true; // Флаг для неавтоматического оружия

  private options: BaseWeaponOptions;

  private audioAssets: AudioAssets = {
    fire: null,
    empty: null,
    reload: null
  }

  constructor(id: string, scene: Phaser.Scene, player: Player, options: BaseWeaponOptions) {
    this.id = id;
    this.scene = scene;
    this.player = player;
    this.options = options;
    this.currentAmmo = this.options.magazineSize;
    
    this.loadAudioAssets();
    logger.info(`Оружие создано: ${id}, магазин: ${this.currentAmmo}/${this.options.magazineSize}`);
  }

  /**
   * Возвращает идентификатор оружия
   */
  public getId(): string {
    return this.id;
  }

  loadAudioAssets(): void {
    if (this.options.fireSoundPath) {
      // Сначала загружаем звук
      this.scene.load.audio(this.options.fireSoundPath, this.options.fireSoundPath);
      setTimeout(() => {
        this.audioAssets.fire = this.scene.sound.add(this.options.fireSoundPath!, { volume: settings.audio.weaponsVolume });
        logger.debug(`Загружен звук выстрела: ${this.options.fireSoundPath}`);
      }, 100)
      // this.scene.load.once('complete', () => {    });
      this.scene.load.start();
    }

    if (this.options.emptySoundPath) {
      this.audioAssets.empty = this.scene.sound.add(this.options.emptySoundPath, { volume: settings.audio.weaponsVolume });
    } 

    if (this.options.reloadSoundPath) {
      this.audioAssets.reload = this.scene.sound.add(this.options.reloadSoundPath, { volume: settings.audio.weaponsVolume });
    }
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public canFire(time: number): boolean {
    // Если перезаряжаемся, стрелять нельзя
    if (this.isReloading) return false;
    
    // Если нет патронов, стрелять нельзя
    if (this.currentAmmo <= 0) return false;
    
    // Для неавтоматического оружия проверяем, был ли отпущен курок
    if (!this.options.automatic && !this.canFireAgain) return false;
    
    // Проверяем задержку между выстрелами
    return time - this.lastFired >= this.options.fireRate;
  }

  public isEmpty(): boolean {
    return this.currentAmmo <= 0 && !this.isReloading;
  }

  public reload(): void {
    if (this.isReloading || this.currentAmmo === this.options.magazineSize) return;
    
    this.playReloadSound();
    this.isReloading = true;
    logger.info(`Начало перезарядки ${this.id}, текущие патроны: ${this.currentAmmo}`);
    
    // Устанавливаем таймер на перезарядку
    this.scene.time.delayedCall(this.options.reloadTime, () => {
      this.currentAmmo = this.options.magazineSize;
      this.isReloading = false;
      logger.info(`Перезарядка завершена. Патроны: ${this.currentAmmo}`);
    });
  }

  protected calculateTargetPoint(x: number, y: number, direction: number = 1): { targetX: number, targetY: number } {
    const currentTime = this.scene.time.now;
    const timeSinceLastShot = currentTime - this.lastFired;
    
    // Если это первый выстрел или прошло много времени с последнего выстрела
    if (this.lastFired === 0 || timeSinceLastShot >= this.options.aimingTime) {
      return {
        targetX: x + this.options.range * direction,
        targetY: y
      };
    }
    
    // Рассчитываем множитель разброса в зависимости от частоты стрельбы
    // Чем меньше времени прошло с последнего выстрела, тем больше разброс
    const spreadMultiplier = Math.min(1, (this.options.aimingTime - timeSinceLastShot) / this.options.aimingTime);
    const currentSpread = this.options.spreadAngle * spreadMultiplier;
    
    // Получаем случайный угол в пределах текущего разброса
    const randomAngle = Phaser.Math.DegToRad(
      Phaser.Math.Between(-currentSpread, currentSpread)
    );
    
    // Рассчитываем конечную точку с учетом угла (стрельба всегда вправо)
    return {
      targetX: x + Math.cos(randomAngle) * this.options.range * direction,
      targetY: y + Math.sin(randomAngle) * this.options.range
    };
  }

  /**
   * Создает пулю в зависимости от типа оружия
   */
  protected createBullet(x: number, y: number): BaseBullet {
    // Базовая реализация просто создает BaseBullet
    // Подклассы могут переопределить этот метод для создания специфичных пуль
    return new this.options.bulletClass(this.scene, x, y);
  }

  public fire(x: number, y: number, direction: number = 1) {
    if (!this.canFire(this.scene.time.now)) {
      if (this.isEmpty()) {
        this.playEmptySound();
        logger.debug('Попытка выстрела из пустого оружия');
      }
      return null;
    }
    
    // Для неавтоматического оружия блокируем следующий выстрел
    if (!this.options.automatic) {
      this.canFireAgain = false;
    }
    
    // Создаем пулю с помощью специального метода
    const bullet = this.createBullet(x, y);
    
    // Передаем пулю в группу bullets сцены GameplayScene
    if (this.scene instanceof GameplayScene) {
      const gameScene = this.scene as GameplayScene;
      gameScene.getBulletsGroup().add(bullet.getSprite());
      
      // Создаем гильзу после выстрела
      this.ejectShellCasing(x, y, direction);
    }
    
    // Рассчитываем точку прицеливания с учетом разброса и направления
    const { targetX, targetY } = this.calculateTargetPoint(x, y, direction);

    // Отладочная информация
    logger.debug(`Выстрел из (${x.toFixed(0)}, ${y.toFixed(0)}) в (${targetX.toFixed(0)}, ${targetY.toFixed(0)}), направление: ${direction}`);

    bullet.fire(x, y, targetX, targetY, this.options.speed, this.options.damage, this.options.range);
    this.playFireSound();
    
    // Применяем отдачу к игроку с учетом направления
    this.applyRecoil(direction);
    
    this.lastFired = this.scene.time.now;
    this.currentAmmo--;
    logger.debug(`Осталось патронов: ${this.currentAmmo}`);
  }

  /**
   * Применяет отдачу от выстрела к игроку
   */
  private applyRecoil(direction: number): void {
    // Рассчитываем силу отдачи
    const recoilForce = this.calculateRecoilForce();
    
    // Отдача всегда направлена влево (как при стрельбе вправо)
    const recoilVectorX = -direction;
    
    // Нет вертикальной составляющей
    const recoilVectorY = 0;
    
    // Уменьшаем множитель силы для более мягкой отдачи
    const boostedForce = recoilForce * 0.5;
    
    // Настройки для экспоненциального затухания
    // Увеличиваем начальную силу воздействия для более быстрого старта
    const strength = 0.25;
    
    // Ускоряем затухание
    const decayRate = 0.08;
    
    // Применяем отдачу к игроку с экспоненциальным затуханием
    // Параметры: (направление по X, направление по Y, сила, скорость, затухание)
    this.player.applyForce(recoilVectorX, recoilVectorY, boostedForce, strength, decayRate);
    
    // Отладочная информация
    console.log(`Отдача: вектор (${recoilVectorX}, ${recoilVectorY}), сила ${boostedForce}, скорость ${strength}, затухание ${decayRate}`);
  }

  /**
   * Рассчитывает силу отдачи с учетом текущего состояния оружия
   */
  private calculateRecoilForce(): number {
    // Базовая сила отдачи из настроек оружия
    let recoilForce = this.options.recoilForce;
    
    // Увеличиваем отдачу при быстрой стрельбе
    const currentTime = this.scene.time.now;
    const timeSinceLastShot = currentTime - this.lastFired;
    
    // Если прошло мало времени с последнего выстрела, увеличиваем отдачу
    if (this.lastFired !== 0 && timeSinceLastShot < this.options.aimingTime) {
      const recoilMultiplier = 1 + (this.options.aimingTime - timeSinceLastShot) / this.options.aimingTime;
      recoilForce *= recoilMultiplier;
    }
    
    // Добавляем немного случайности для реалистичности
    const randomFactor = Phaser.Math.FloatBetween(0.9, 1.1);
    recoilForce *= randomFactor;
    
    return recoilForce;
  }

  // Звук пустого магазина
  protected playEmptySound(): void {
    if (this.audioAssets.empty) {
      this.audioAssets.empty.play();
    }
  }

  // Звук перезарядки
  protected playReloadSound(): void {
    if (this.audioAssets.reload) {
      this.audioAssets.reload.play();
    }
  }

  // Звук выстрела
  protected playFireSound(): void {
    if (this.audioAssets.fire) {
      this.audioAssets.fire.play();
    }
  }

  public update(time: number, delta: number): void {
    // Обновление состояния оружия
  }

  // Метод для сброса блокировки выстрела (вызывается при отпускании кнопки)
  public resetTrigger(): void {
    this.canFireAgain = true;
  }

  /**
   * Выбрасывает гильзу после выстрела
   * @param x Координата X точки выброса
   * @param y Координата Y точки выброса
   * @param direction Направление выстрела (1 вправо, -1 влево)
   */
  protected ejectShellCasing(x: number, y: number, direction: number): void {
    // Проверяем, включена ли функция отображения гильз
    if (!settings.gameplay.shellCasings.enabled) {
      return;
    }
    
    // Создаем новую гильзу
    new ShellCasing(this.scene, x, y, direction);
  }
} 