// После выстрела оружие может наколоняться что внияет на последующие выстрелы
// в момент выстрела мы определяем вектор направления (две точки, старта и прицеливания)
// создание снаряда происходит в момент выстрела
// далее снаряд активируется и действует по своим правилам
// снаряд определяет траекторию исходя из своих настроек и вектора направления и приложенной силы
// Также после создания мы добавить снаряд в HitManager, а в хитменеджере проверрять активацию снаряда
// активация снаряда может быть моментальной, с задержкой или по внешнему воздействию
// В момент активации ицем объекты взаимодействия и передем им разрушение

import * as Phaser from 'phaser';
import { SightEntity, SightEntityOptions } from "./SightEntity";
import { settings } from '../../settings';
import { createLogger } from "../../../utils/logger";
import { GameplayScene } from "../../scenes/GameplayScene/GameplayScene";
import { ShellCasingEntity } from "./ShellCasingEntity";
import { RecoilForceType } from "../types/recoilForce";
import { emitEvent } from "../Events";
import { createProjectile } from "../../projectiles";
import { WeaponOptions, WeaponEvents, FireParams, AudioAssets } from "../types/weaponTypes";

const logger = createLogger('WeaponEntity');

export class WeaponEntity {
  private id: string; 
  private name: string;
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

  private sight: SightEntity | null = null;
  private audioAssets: AudioAssets = {
    fire: null,
    empty: null,
    reload: null,
    afterFire: null,
  }

  constructor(scene: Phaser.Scene, id: string, options: WeaponOptions) {
    this.id = id;
    this.scene = scene;
    this.name = options.name;
    this.options = options;
    this.currentAmmo = this.options.magazineSize;

    if (this.options.sight) {
      this.createSight(this.options.sight)
    }

    this.gameObject = this.scene.add.sprite(0, 0, this.options.texture.key);
    this.gameObject.setScale(this.options.texture.scale);
    this.scene.add.existing(this.gameObject);
    
    this.createAudioAssets()
  }

  protected createSight(options: SightEntityOptions | boolean): void {
    if (typeof options === 'boolean') {
      this.sight = new SightEntity(this.scene);
    } else {
      this.sight = new SightEntity(this.scene, options);
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

  public getFirePoint(): [number, number] {
    const offsetX = this.options?.firePointOffset?.[0] || 0;
    const offsetY = this.options?.firePointOffset?.[1] || 0;
    const x = this.gameObject.x + this.gameObject.width * this.gameObject.scale / 2;
    const y = this.gameObject.y;
    return [x + offsetX, y + offsetY];
  }

  public fire({ playerId }: FireParams): RecoilForceType | null {
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

    const [firePointX, firePointY] = this.getFirePoint();

    // Учитываем текущий наклон при создании снаряда
    const sightX = firePointX + 150;
    const sightY = firePointY + Math.tan(this.weaponAngle) * (sightX - firePointX);

    this.createProjectile(playerId, firePointX, firePointY, sightX, sightY);

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

  protected createProjectile(playerId: string, x: number, y: number, sightX: number, sightY: number): void {
    if (!this.options.projectile || !(this.scene instanceof GameplayScene)) {
      return;
    }

    const projectile = createProjectile(this.scene, this.options.projectile, x, y, playerId, this.name);
    projectile.setForceVector(sightX, sightY, this.options.speed, this.options.damage);
    
    emitEvent(this.scene, WeaponEvents.FireEvent, { projectile });
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
    const aimingTime = this.options.aimingTime || 0;
    if (this.lastFired !== 0 && timeSinceLastShot < aimingTime) {
      const recoilMultiplier = 1 + (aimingTime - timeSinceLastShot) / aimingTime;
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

    if (this.sight) {
      const [firePointX, firePointY] = this.getFirePoint();
      const [sightX, sightY] = this.sight.getSightPoint();
      this.sight.setPosition(sightX, firePointY, this.direction);
    }
  }

  /**
   * Обновляет наклон оружия, постепенно возвращая его в нормальное положение
   */
  private updateWeaponTilt(time: number, delta: number): void {
    if (this.weaponAngle === 0) return;

    // Если прошло меньше времени, чем aimingTime с момента последнего выстрела
    const timeSinceLastShot = time - this.lastFired;
    const aimingTime = this.options.aimingTime || 0;

    if (timeSinceLastShot < aimingTime) {
      // Рассчитываем коэффициент прогресса (0 -> 1)
      const progress = timeSinceLastShot / aimingTime;
      
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
    this.direction = direction;
    const offsetX = this.options?.texture.offset.x || 0;
    const offsetY = this.options?.texture.offset.y || 0;

    this.x = x + offsetX;
    this.y = y + offsetY;
    this.gameObject.setPosition(this.x, this.y);

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
    new ShellCasingEntity(this.scene, x, y, direction);
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
    const angleRange = Phaser.Math.DegToRad(this.options.spreadAngle || 0);
    this.weaponAngle = Phaser.Math.FloatBetween(-angleRange, angleRange);
    
    // Применяем наклон к спрайту оружия
    this.gameObject.setRotation(this.weaponAngle);
  }
}