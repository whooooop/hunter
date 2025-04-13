// После выстрела оружие может наколоняться что внияет на последующие выстрелы
// в момент выстрела мы определяем вектор направления (две точки, старта и прицеливания)
// создание снаряда происходит в момент выстрела
// далее снаряд активируется и действует по своим правилам
// снаряд определяет траекторию исходя из своих настроек и вектора направления и приложенной силы
// Также после создания мы добавить снаряд в HitManager, а в хитменеджере проверрять активацию снаряда
// активация снаряда может быть моментальной, с задержкой или по внешнему воздействию
// В момент активации ицем объекты взаимодействия и передем им разрушение

import { BaseWeaponSight, BaseWeaponSightOptions } from "../BaseWeaponSight";
import { settings } from '../../settings';
import { createLogger } from "../../../utils/logger";
import { GameplayScene } from "../../scenes/GameplayScene/GameplayScene";
import { ShellCasing } from "../../entities/ShellCasing";
import { BaseProjectileClass } from "../BaseProjectile";
import { RecoilForceType } from "../types/recoilForce";

const logger = createLogger('WeaponEntity');

interface WeaponOptions {
  texture: string;

  // Патроны
  damage: number;       // Урон от одного выстрела
  speed: number[];      // Скорость снаряда

  scale: number;
  offsetX: number;
  offsetY: number;

  // Перезарядка
  reloadTime: number; // Скорость перезарядки в мс
  magazineSize: number; // Размер магазина

  // Параметры стрельбы
  fireRate: number; // Задержка между выстрелами в мс
  spreadAngle: number; // Угол разброса при выстреле в градусах
  aimingTime: number; // Время прицеливания в секундах
  canAim: boolean; // Можно ли прицеливаться
  range: number; // Дистанция стрельбы
  automatic: boolean; // Является ли оружие автоматическим
  autoreload?: boolean; // Автоматическая перезарядка
  hideWhileReload?: boolean; // Скрывать оружие при перезарядке

  // Параметры отдачи
  recoilForce: number; // Сила отдачи
  recoilRecovery: number; // Скорость восстановления от отдачи

  emptyAudio?: string;
  reloadAudio?: string;
  afterFireAudio?: string;
  fireAudio?: string;

  shellCasings: boolean;
  sight: BaseWeaponSightOptions | boolean;
  projectile?: BaseProjectileClass
}

type AudioAssets = {
  fire: Phaser.Sound.BaseSound | null;
  empty: Phaser.Sound.BaseSound | null;
  reload: Phaser.Sound.BaseSound | null;
  afterFire: Phaser.Sound.BaseSound | null;
}

export class WeaponEntity {
  private active: boolean = false;
  private scene: Phaser.Scene;
  private gameObject: Phaser.GameObjects.Sprite;

  protected lastFired: number = 0;
  protected isReloading: boolean = false;
  protected currentAmmo: number = 0;
  protected canFireAgain: boolean = true; // Флаг для неавтоматического оружия
  protected weaponAngle: number = 0; // Текущий угол наклона оружия
  protected options: WeaponOptions;

  protected x: number = 0;
  protected y: number = 0;
  protected direction: number = 1;

  private sight: BaseWeaponSight | null = null;
  private audioAssets: AudioAssets = {
    fire: null,
    empty: null,
    reload: null,
    afterFire: null,
  }

  constructor(scene: Phaser.Scene, options: WeaponOptions) {
    this.scene = scene;
    this.options = options;
    this.currentAmmo = this.options.magazineSize;

    if (this.options.sight) {
      this.createSight(this.options.sight)
    }

    this.gameObject = this.scene.add.sprite(0, 0, this.options.texture);
    this.gameObject.setScale(this.options.scale);
    this.scene.add.existing(this.gameObject);
    
    this.createAudioAssets()
  }

  protected createSight(options: BaseWeaponSightOptions | boolean): void {
    if (typeof options === 'boolean') {
      this.sight = new BaseWeaponSight(this.scene);
    } else {
      this.sight = new BaseWeaponSight(this.scene, options);
    }
    this.updateSightState();
  }

  protected createAudioAssets(): void {
    if (this.options.fireAudio) {
      this.audioAssets.fire = this.scene.sound.add(this.options.fireAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.emptyAudio) {
      this.audioAssets.empty = this.scene.sound.add(this.options.emptyAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.reloadAudio) {
      this.audioAssets.reload = this.scene.sound.add(this.options.reloadAudio, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.afterFireAudio) {
      this.audioAssets.afterFire = this.scene.sound.add(this.options.afterFireAudio, { volume: settings.audio.weaponsVolume });
    }
  }

  public activate(active: boolean): void {
    this.active = active;
  }

  public getActive(): boolean {
    return this.active;
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
    
    if (this.options.hideWhileReload) {
      this.gameObject.setVisible(false);
    }

    // Устанавливаем таймер на перезарядку
    this.scene.time.delayedCall(this.options.reloadTime, () => {
      this.currentAmmo = this.options.magazineSize;
      this.isReloading = false;
      this.gameObject.setVisible(true);
      this.updateSightState();
    });
  }

  public fire(): RecoilForceType | null {
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

    const sightX = this.x + 1;
    const sightY = this.y;

    // Учитываем текущий наклон при создании снаряда
    const adjustedSightY = this.y + Math.tan(this.weaponAngle) * (sightX - this.x);
    
    this.createProjectile(this.x, this.y, sightX, adjustedSightY);

    // Создаем гильзу после выстрела
    if (this.options.shellCasings && this.scene instanceof GameplayScene) {
      this.ejectShellCasing(this.x, this.y, this.direction);
    }

    // Применяем отдачу к игроку с учетом направления
    const recoil = this.options.recoilForce ? this.applyRecoil(this.direction) : null;

    this.playFireSound();
    
    // Наклоняем оружие после выстрела
    this.applyWeaponTilt();
    
    this.lastFired = this.scene.time.now;
    this.currentAmmo--;

    if (this.options.autoreload && this.currentAmmo <= 0) {
      this.reload();
    }

    this.updateSightState();
    this.afterFire();

    return recoil;
  }

  protected createProjectile(x: number, y: number, sightX: number, sightY: number): void {
    if (!this.options.projectile || !(this.scene instanceof GameplayScene)) {
      return;
    }

    const projectile = new this.options.projectile();
    projectile
      .create(this.scene, x, y)
      .setForceVector(sightX, sightY, this.options.speed, this.options.damage);
    
    const gameScene = this.scene as GameplayScene;
    gameScene.addProjectile(projectile);
  }

  /**
   * Применяет отдачу от выстрела к игроку
   */
  private applyRecoil(direction: number): RecoilForceType {
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
    return { recoilVectorX, recoilVectorY, boostedForce, strength, decayRate }; 
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
    // Постепенно возвращаем оружие в нормальное положение
    this.updateWeaponTilt(time, delta);
  }

  /**
   * Обновляет наклон оружия, постепенно возвращая его в нормальное положение
   */
  private updateWeaponTilt(time: number, delta: number): void {
    if (this.weaponAngle === 0) return;

    // Если прошло меньше времени, чем aimingTime с момента последнего выстрела
    const timeSinceLastShot = time - this.lastFired;
    
    if (timeSinceLastShot < this.options.aimingTime) {
      // Рассчитываем коэффициент прогресса (0 -> 1)
      const progress = timeSinceLastShot / this.options.aimingTime;
      
      // Линейно интерполируем от текущего угла к 0
      this.weaponAngle = Phaser.Math.Linear(this.weaponAngle, 0, progress);
      
      // Применяем текущий угол наклона
      this.gameObject.setRotation(this.weaponAngle);
    } else {
      // Полностью выравниваем оружие
      this.weaponAngle = 0;
      this.gameObject.setRotation(0);
    }
  }

  public setDepth(depth: number) {
    this.gameObject.setDepth(depth);
    return this;
  }

  public setPosition(x: number, y: number, direction: number) {
    const offsetX = this.options?.offsetX || 0;
    const offsetY = this.options?.offsetY || 0;
    this.direction = direction;
    this.x = x + offsetX;
    this.y = y + offsetY;
    this.gameObject.setPosition(x, y);

    if (this.sight) {
      this.sight.setPosition(x, y, direction);
    } 

    return this;
  }

  // Метод для сброса блокировки выстрела (вызывается при отпускании кнопки)
  public resetTrigger(): void {
    this.canFireAgain = true;
  }

  public updateSightState(): void {
    if (this.sight) {
      this.sight.setActive(this.currentAmmo > 0);
    }
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
    const angleRange = Phaser.Math.DegToRad(this.options.spreadAngle);
    this.weaponAngle = Phaser.Math.FloatBetween(-angleRange, angleRange);
    
    // Применяем наклон к спрайту оружия
    this.gameObject.setRotation(this.weaponAngle);
  }
}