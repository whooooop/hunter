import * as Phaser from 'phaser';
import { GameplayScene } from '../scenes/GameplayScene';
import { Player } from '../entities/Player';
import { settings } from '../settings';
import { createLogger } from '../../utils/logger';
import { ShellCasing } from '../entities/ShellCasing';
import { BaseWeaponSight, BaseWeaponSightOptions } from './BaseWeaponSight';
import { BaseProjectile, BaseProjectileClass } from './BaseProjectile';

const logger = createLogger('BaseWeapon');

interface BaseWeaponOptions {
  name: string;
  texture: string;
  scale: number;

  offsetX: number;
  offsetY: number;

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
  canAim: boolean; // Можно ли прицеливаться
  range: number; // Дистанция стрельбы
  automatic: boolean; // Является ли оружие автоматическим
  
  // Параметры отдачи
  recoilForce: number; // Сила отдачи
  recoilRecovery: number; // Скорость восстановления от отдачи

  // Звуки
  emptyAudio?: string;
  reloadAudio?: string;
  afterFireAudio?: string;
  fireAudio?: string;

  sight: BaseWeaponSightOptions | boolean;
  shellCasings: boolean;

  projectile?: BaseProjectileClass
}


type AudioAssets = {
  fire: Phaser.Sound.BaseSound | null;
  empty: Phaser.Sound.BaseSound | null;
  reload: Phaser.Sound.BaseSound | null;
  afterFire: Phaser.Sound.BaseSound | null;
}

export class BaseWeapon extends Phaser.GameObjects.Sprite {
  protected player: Player | null = null;
  
  protected lastFired: number = 0;
  protected isReloading: boolean = false;
  protected currentAmmo: number = 0;
  protected currentRecoil: number = 0;
  protected canFireAgain: boolean = true; // Флаг для неавтоматического оружия
  protected weaponAngle: number = 0; // Текущий угол наклона оружия

  private baseOptions: BaseWeaponOptions;

  private audioAssets: AudioAssets = {
    fire: null,
    empty: null,
    reload: null,
    afterFire: null,
  }

  private sight: BaseWeaponSight | null = null;

  constructor(scene: Phaser.Scene, options: BaseWeaponOptions) {
    super(scene, 0, 0, options.texture);
    this.name = options.name;
    this.baseOptions = options;
    this.setScale(this.baseOptions.scale);
  }

  create(player: Player): void {
    this.player = player;
    this.currentAmmo = this.baseOptions.magazineSize;

    this.createSight()
    this.createAudioAssets()
  }

  protected createSight(): void {
    if (!this.baseOptions.sight) {
      return;
    }
    if (typeof this.baseOptions.sight === 'boolean') {
      this.sight = new BaseWeaponSight(this.scene);
    } else {
      this.sight = new BaseWeaponSight(this.scene, this.baseOptions.sight);
    }
  }

  protected createAudioAssets(): void {
    if (this.baseOptions.fireAudio) {
      this.audioAssets.fire = this.scene.sound.add(this.baseOptions.fireAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.baseOptions.emptyAudio) {
      this.audioAssets.empty = this.scene.sound.add(this.baseOptions.emptyAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.baseOptions.reloadAudio) {
      this.audioAssets.reload = this.scene.sound.add(this.baseOptions.reloadAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.baseOptions.afterFireAudio) {
      this.audioAssets.afterFire = this.scene.sound.add(this.baseOptions.afterFireAudio, { volume: settings.audio.weaponsVolume });
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
    if (!this.baseOptions.automatic && !this.canFireAgain) return false;
    
    // Проверяем задержку между выстрелами
    return time - this.lastFired >= this.baseOptions.fireRate;
  }

  public isEmpty(): boolean {
    return this.currentAmmo <= 0 && !this.isReloading;
  }

  public reload(): void {
    if (this.isReloading || this.currentAmmo === this.baseOptions.magazineSize) return;
    
    this.playReloadSound();
    this.isReloading = true;
    logger.info(`Начало перезарядки ${this.name}, текущие патроны: ${this.currentAmmo}`);
    
    // Устанавливаем таймер на перезарядку
    this.scene.time.delayedCall(this.baseOptions.reloadTime, () => {
      this.currentAmmo = this.baseOptions.magazineSize;
      this.isReloading = false;
      logger.info(`Перезарядка завершена. Патроны: ${this.currentAmmo}`);
    });
  }

  protected calculateTargetPoint(x: number, y: number, direction: number = 1): { targetX: number, targetY: number } {
    const currentTime = this.scene.time.now;
    const timeSinceLastShot = currentTime - this.lastFired;
    
    // Если это первый выстрел или прошло много времени с последнего выстрела
    if (this.baseOptions.canAim && (this.lastFired === 0 || timeSinceLastShot >= this.baseOptions.aimingTime)) {
      return {
        targetX: x + this.baseOptions.range * direction,
        targetY: y
      };
    }
    
    // Рассчитываем множитель разброса в зависимости от частоты стрельбы
    // Чем меньше времени прошло с последнего выстрела, тем больше разброс
    // const spreadMultiplier = Math.min(1, (this.baseOptions.aimingTime - timeSinceLastShot) / this.baseOptions.aimingTime);
    const spreadMultiplier = 1;
    const currentSpread = this.baseOptions.spreadAngle * spreadMultiplier;
    
    // Получаем случайный угол в пределах текущего разброса
    const randomAngle = Phaser.Math.DegToRad(
      Phaser.Math.Between(-currentSpread, currentSpread)
    );
    
    // Рассчитываем конечную точку с учетом угла (стрельба всегда вправо)
    return {
      targetX: x + Math.cos(randomAngle) * this.baseOptions.range * direction,
      targetY: y + Math.sin(randomAngle) * this.baseOptions.range
    };
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
    if (!this.baseOptions.automatic) {
      this.canFireAgain = false;
    }

 

    const sightX = x + 1;
    const sightY = y;

    // Учитываем текущий наклон при создании снаряда
    const adjustedSightY = y + Math.tan(this.weaponAngle) * (sightX - x);
    
    this.createProjectile(x, y, sightX, adjustedSightY);

    // Создаем гильзу после выстрела
    if (this.baseOptions.shellCasings && this.scene instanceof GameplayScene) {
      this.ejectShellCasing(x, y, direction);
    }

    // Применяем отдачу к игроку с учетом направления
    if (this.baseOptions.recoilForce) {
      this.applyRecoil(direction);
    }

    this.playFireSound();
    
    // Наклоняем оружие после выстрела
    this.applyWeaponTilt();
    
    this.lastFired = this.scene.time.now;
    this.currentAmmo--;

    this.afterFire();
  }

  protected createProjectile(x: number, y: number, sightX: number, sightY: number): void {
    if (!this.baseOptions.projectile || !(this.scene instanceof GameplayScene)) {
      return;
    }

    const projectile = new this.baseOptions.projectile();
    projectile
      .create(this.scene, x, y)
      .setForceVector(sightX, sightY, this.baseOptions.speed, this.baseOptions.damage);
    
    const gameScene = this.scene as GameplayScene;
    gameScene.addProjectile(projectile);
  }

  /**
   * Применяет отдачу от выстрела к игроку
   */
  private applyRecoil(direction: number): void {
    if (!this.player) {
      return;
    }
    
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
  }

  /**
   * Рассчитывает силу отдачи с учетом текущего состояния оружия
   */
  private calculateRecoilForce(): number {
    // Базовая сила отдачи из настроек оружия
    let recoilForce = this.baseOptions.recoilForce;
    
    // Увеличиваем отдачу при быстрой стрельбе
    const currentTime = this.scene.time.now;
    const timeSinceLastShot = currentTime - this.lastFired;
    
    // Если прошло мало времени с последнего выстрела, увеличиваем отдачу
    if (this.lastFired !== 0 && timeSinceLastShot < this.baseOptions.aimingTime) {
      const recoilMultiplier = 1 + (this.baseOptions.aimingTime - timeSinceLastShot) / this.baseOptions.aimingTime;
      recoilForce *= recoilMultiplier;
    }
    
    // Добавляем немного случайности для реалистичности
    const randomFactor = Phaser.Math.FloatBetween(0.9, 1.1);
    recoilForce *= randomFactor;
    
    return recoilForce;
  }

  protected afterFire(): void {
    if (this.currentAmmo > 0) {
      this.scene.time.delayedCall(500, () => {
        this.playAfterFireSound();
      });
    }
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

  // Звук после выстрела
  protected playAfterFireSound(): void {
    if (this.audioAssets.afterFire) {
      this.audioAssets.afterFire.play();
    }
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);

    // Постепенно возвращаем оружие в нормальное положение
    this.updateWeaponTilt(time, delta);

    if (this.sight && this.player) {
      const playerSprite = this.player.getSprite();
      // Обновляем позицию прицела используя координаты спрайта игрока
      this.sight.update(
        playerSprite.x,
        playerSprite.y,
        this.player.getDirection(),
        this.currentAmmo > 0
      );
    } 
    if (this.player) {
      this.setPosition(this.player.x, this.player.y);
    }
  }

  /**
   * Обновляет наклон оружия, постепенно возвращая его в нормальное положение
   */
  private updateWeaponTilt(time: number, delta: number): void {
    if (this.weaponAngle === 0) return;

    // Если прошло меньше времени, чем aimingTime с момента последнего выстрела
    const timeSinceLastShot = time - this.lastFired;
    
    if (timeSinceLastShot < this.baseOptions.aimingTime) {
      // Рассчитываем коэффициент прогресса (0 -> 1)
      const progress = timeSinceLastShot / this.baseOptions.aimingTime;
      
      // Линейно интерполируем от текущего угла к 0
      this.weaponAngle = Phaser.Math.Linear(this.weaponAngle, 0, progress);
      
      // Применяем текущий угол наклона
      this.setRotation(this.weaponAngle);
    } else {
      // Полностью выравниваем оружие
      this.weaponAngle = 0;
      this.setRotation(0);
    }
  }

  public setDepth(depth: number) {
    super.setDepth(depth);
    return this;
  }

  public setPosition(x: number, y: number) {
    const offsetX = this.baseOptions?.offsetX || 0;
    const offsetY = this.baseOptions?.offsetY || 0;
    super.setPosition(x + offsetX, y + offsetY);
    return this;
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

  public destroy(): void {
    if (this.sight) {
      this.sight.destroy();
      this.sight = null;
    }
  }

  /**
   * Применяет случайный наклон к оружию после выстрела
   */
  private applyWeaponTilt(): void {
    // Генерируем случайный угол в рамках диапазона разброса
    const angleRange = Phaser.Math.DegToRad(this.baseOptions.spreadAngle);
    this.weaponAngle = Phaser.Math.FloatBetween(-angleRange, angleRange);
    
    // Применяем наклон к спрайту оружия
    this.setRotation(this.weaponAngle);
  }
} 


// После выстрела оружие может наколоняться что внияет на последующие выстрелы
// в момент выстрела мы определяем вектор направления (две точки, старта и прицеливания)
// создание снаряда происходит в момент выстрела
// далее снаряд активируется и действует по своим правилам
// снаряд определяет траекторию исходя из своих настроек и вектора направления и приложенной силы
// Также после создания мы добавить снаряд в HitManager, а в хитменеджере проверрять активацию снаряда
// активация снаряда может быть моментальной, с задержкой или по внешнему воздействию
// В момент активации ицем объекты взаимодействия и передем им разрушение