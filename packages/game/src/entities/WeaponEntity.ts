import { StorageSpace, SyncCollectionRecord } from '@hunter/multiplayer';
import { WeaponFireEvent, WeaponReloadEvent } from '@hunter/storage-proto/src/storage';
import * as Phaser from 'phaser';
import { MuzzleFlash } from '../fx/muzzleFlash/muzzleFlashFx';
import { emitEvent } from "../GameEvents";
import { GameplayScene } from "../scenes/Gameplay";
import { AudioService } from '../services/AudioService';
import { SettingsService } from '../services/SettingsService';
import { fireEventCollection, reloadEventCollection } from '../storage/collections/events.collection';
import { AudioAssets, FireParams, Weapon } from "../types";
import { RecoilForceType } from "../types/recoilForce";
import { createLogger } from "../utils/logger";
import { sleep } from '../utils/sleep';
import { generateId } from '../utils/stringGenerator';
import { WeaponType } from '../weapons/WeaponTypes';
import { ShellCasingEntity } from "./ShellCasingEntity";
import { SightEntity, SightEntityOptions } from "./SightEntity";

const logger = createLogger('WeaponEntity');

export class WeaponEntity {
  private name: WeaponType;
  private active: boolean = false;
  private gameObject: Phaser.GameObjects.Sprite;
  private settingsService: SettingsService;

  protected lastFired: number = 0;
  protected lastEmptySoundTime: number = 0;

  protected isBolt: boolean = false;

  protected currentAmmo: number = 0;
  protected canFireAgain: boolean = true; // Флаг для неавтоматического оружия
  protected weaponAngle: number = 0; // Текущий угол наклона оружия

  private container: Phaser.GameObjects.Container;
  private debugFirePoint!: Phaser.GameObjects.Ellipse;
  private muzzleFlash: MuzzleFlash | null = null;

  protected isReloading: boolean = false;
  protected reloadProgress: number = 0;
  protected reloadTime: number = 0;
  protected reloadTimeLeft: number = 0;

  protected velocityX: number = 0;
  protected velocityY: number = 0;

  protected x: number = 0;
  protected y: number = 0;
  protected direction: number = 1;

  private sight: SightEntity | null = null;
  private audioAssets: AudioAssets = {
    fire: null,
    empty: null,
    reload: null,
    reloadItem: null,
    bolt: null,
  }

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly id: string,
    private readonly options: Weapon.Config,
    private readonly playerId: string,
    private readonly storage: StorageSpace,
    private readonly showSight: boolean
  ) {
    this.name = options.name;
    this.currentAmmo = this.options.magazineSize;
    this.settingsService = SettingsService.getInstance();
    this.gameObject = this.scene.add.sprite(0, 0, this.options.texture.key);
    this.gameObject.setScale(this.options.texture.scale);
    this.container = scene.add.container(0, 0);
    this.container.add(this.gameObject);
    this.scene.add.existing(this.container);

    if (this.options.sight && this.showSight) {
      this.createSight(this.options.sight)
    }

    if (this.options.muzzleFlash) {
      this.createMuzzleFlash(this.options.muzzleFlash);
    }

    this.container.setAlpha(0);

    this.storage.on<WeaponFireEvent>(fireEventCollection, 'Add', this.handleFireAction.bind(this));
    this.storage.on<WeaponReloadEvent>(reloadEventCollection, 'Add', this.handleReloadAction.bind(this));
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  private handleFireAction(eventId: string, record: SyncCollectionRecord<WeaponFireEvent>): void {
    if (record.data.weaponId == this.id) {
      this.fireAction(this.playerId, {
        x: record.data.originX,
        y: record.data.originY,
      }, {
        x: record.data.targetX,
        y: record.data.targetY,
      },
        record.data.angleTilt
      );
    }
  }

  private handleReloadAction(eventId: string, record: SyncCollectionRecord<WeaponReloadEvent>): void {
    if (record.data.weaponId == this.id) {
      this.reloadAction();
    }
  }

  private createMuzzleFlash({ scale }: { scale: number }): void {
    const { innerX, innerY } = this.getFirePoint();
    this.muzzleFlash = new MuzzleFlash(this.scene, innerX, innerY, { scale });
    this.container.add(this.muzzleFlash.getContainer());
  }

  protected createSight(options: SightEntityOptions | boolean): void {
    if (typeof options === 'boolean') {
      this.sight = new SightEntity(this.scene);
    } else {
      this.sight = new SightEntity(this.scene, options);
    }
    const { innerX, innerY } = this.getFirePoint();

    this.sight.setPosition(innerX, innerY, this.direction);

    this.container.add(this.sight.getGameObject());
    this.updateSightState();
  }

  public activate(active: boolean): void {
    this.active = active;
  }

  public getActive(): boolean {
    return this.active;
  }

  public getIsReloading(): boolean {
    return this.isReloading;
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public getMaxAmmo(): number {
    return this.options.magazineSize;
  }

  public canFire(time: number): boolean {
    // Если перезаряжаемся, стрелять нельзя
    if (this.isReloading) return false;

    // Если взвод затвора, стрелять нельзя
    if (this.isBolt) return false;

    // Если нет патронов, стрелять нельзя
    if (this.isEmpty()) return false;

    // Для неавтоматического оружия проверяем, был ли отпущен курок
    if (!this.canFireAgain) return false;

    // Проверяем задержку между выстрелами
    return time - this.lastFired >= this.options.fireRate;
  }

  public isEmpty(): boolean {
    return this.currentAmmo <= 0;
  }

  public reload(): void {
    if (this.isReloading || this.isBolt || this.currentAmmo === this.options.magazineSize) return;

    this.storage.getCollection<WeaponReloadEvent>(reloadEventCollection)!.addItem(generateId(), {
      weaponId: this.id,
    });
    this.reloadAction();
  }

  private async reloadAction(): Promise<void> {
    this.isReloading = true;

    if (this.options.reloadByOne) {
      this.reloadTime = this.options.reloadTime + (this.options.magazineSize - this.currentAmmo) * (this.options.reloadItemTime || 200);
    } else {
      this.reloadTime = this.options.reloadTime;
    }

    this.reloadTimeLeft = this.reloadTime;

    this.playReloadSound();

    if (this.options.hideWhileReload) {
      this.gameObject.setVisible(false);
    }

    this.updateSightState();
    // Устанавливаем таймер на перезарядку
    this.scene.time.delayedCall(this.options.reloadTime, async () => {
      if (this.options.reloadByOne) {
        const count = this.options.magazineSize - this.currentAmmo;
        for (let i = 0; i < count; i++) {
          this.playReloadItemSound();
          this.currentAmmo++;
          await sleep(this.options.reloadItemTime || 200);
        }
      }
    });
  }

  private endReload(): void {
    this.currentAmmo = this.options.magazineSize;
    this.isReloading = false;
    this.gameObject.setVisible(true);
    this.updateSightState();
    this.belt();
  }

  public getFirePoint(): { innerX: number, innerY: number, worldX: number, worldY: number } {
    const offsetX = this.options?.firePointOffset?.[0] || 0;
    const offsetY = this.options?.firePointOffset?.[1] || 0;
    const x = this.gameObject.width * this.gameObject.scale / 2;
    const y = 0;

    const worldMatrix = this.container.getWorldTransformMatrix();

    return {
      innerX: x + offsetX,
      innerY: y + offsetY,
      worldX: worldMatrix.tx + x + offsetX,
      worldY: worldMatrix.ty + y + offsetY,
    };
  }

  public fire({ playerId }: FireParams): RecoilForceType | null {
    if (!this.canFire(this.scene.time.now)) {
      if (this.isEmpty() && !this.isBolt && this.canFireAgain && !this.isReloading && this.lastEmptySoundTime + 200 < this.scene.time.now) {
        this.playEmptySound();
        this.lastEmptySoundTime = this.scene.time.now;
        if (this.options.triggerRelease) {
          this.canFireAgain = false;
        }
      }
      return null;
    }

    if (this.options.triggerRelease) {
      this.canFireAgain = false;
    }

    this.lastEmptySoundTime = this.scene.time.now;

    const { worldX, worldY } = this.getFirePoint();
    const originPoint = { x: worldX, y: worldY };

    // Учитываем текущий наклон при создании снаряда
    const worldSightX = originPoint.x + 150;
    const worldSightY = originPoint.y + Math.tan(this.weaponAngle) * (worldSightX - originPoint.x);
    const targetPoint = { x: worldSightX, y: worldSightY };

    // Применяем отдачу к игроку с учетом направления
    const recoil = this.options.recoilForce ? this.applyRecoil(this.direction) : null;
    const angleTilt = this.calculateAnleTilt();

    this.currentAmmo--;

    this.storage.getCollection<WeaponFireEvent>(fireEventCollection)!.addItem(generateId(), {
      weaponId: this.id,
      playerId,
      originX: originPoint.x,
      originY: originPoint.y,
      targetX: targetPoint.x,
      targetY: targetPoint.y,
      angleTilt
    });
    this.fireAction(playerId, originPoint, targetPoint, angleTilt);

    if (this.options.autoreload && this.isEmpty()) {
      this.reload();
    } else if (!this.options.automatic) {
      this.belt();
    }

    this.updateSightState();

    return recoil;
  }

  private fireAction(playerId: string, originPoint: { x: number, y: number }, targetPoint: { x: number, y: number }, angleTilt: number) {
    this.lastFired = this.scene.time.now;

    if (this.options.projectile) {
      emitEvent(this.scene, Weapon.Events.CreateProjectile.Local, {
        playerId,
        speed: this.options.speed,
        damage: this.options.damage,
        weaponName: this.name,
        projectile: this.options.projectile!,
        originPoint,
        targetPoint,
        velocity: {
          x: this.velocityX,
          y: this.velocityY
        }
      });
    }

    // Создаем гильзу после выстрела
    if (this.options.shellCasings && this.scene instanceof GameplayScene) {
      this.ejectShellCasing(originPoint.x, originPoint.y, this.direction);
    }

    this.muzzleFlash?.play();
    this.playFireSound();
    this.applyWeaponTilt(angleTilt);
  }

  private belt(): void {
    this.isBolt = true;

    if (!this.options.boltTime) {
      this.isBolt = false;
      return;
    }

    this.playBoltSound();
    this.scene.time.delayedCall(this.options.boltTime, () => {
      this.isBolt = false;
      this.updateSightState();
    });
  }

  // Генерируем случайный угол в рамках диапазона разброса
  protected calculateAnleTilt(): number {
    const angleRange = Phaser.Math.DegToRad(this.options.spreadAngle || 0);
    return Phaser.Math.FloatBetween(-angleRange, angleRange);
  }

  protected createProjectileEvent(playerId: string, originPoint: { x: number, y: number }, targetPoint: { x: number, y: number }): void {

  }

  setVelocity(velocityX: number, velocityY: number): void {
    this.velocityX = velocityX;
    this.velocityY = velocityY;
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

  protected bolt(): void {
    if (this.currentAmmo > 0) {
      this.scene.time.delayedCall(500, () => {
        this.playBoltSound();
      });
    }
  }

  // Звук пустого магазина
  protected playEmptySound(): void {
    if (this.options.emptyAudio) {
      AudioService.playAudio(this.scene, this.options.emptyAudio.key);
    }
  }

  // Звук перезарядки
  protected playReloadSound(): void {
    if (this.options.reloadAudio) {
      AudioService.playAudio(this.scene, this.options.reloadAudio.key);
    }
  }

  protected playReloadItemSound(): void {
    if (this.options.reloadItemAudio) {
      AudioService.playAudio(this.scene, this.options.reloadItemAudio.key);
    }
  }

  // Звук выстрела
  protected playFireSound(): void {
    if (this.options.fireAudio) {
      AudioService.playAudio(this.scene, this.options.fireAudio.key);
    }
  }

  // Звук затвора (взводной механизм)
  protected playBoltSound(): void {
    if (this.options.boltAudio) {
      AudioService.playAudio(this.scene, this.options.boltAudio.key);
    }
  }

  public update(time: number, delta: number): void {
    // Постепенно возвращаем оружие в нормальное положение
    this.updateWeaponTilt(time, delta);

    const { worldX, worldY } = this.getFirePoint();
    emitEvent(this.scene, Weapon.Events.AimPoint.Local, {
      playerId: this.id,
      targetPoint: { x: worldX, y: worldY }
    });

    if (this.isReloading) {
      this.reloadTimeLeft -= delta * this.scene.time.timeScale;
      this.reloadProgress = Math.min(1, 1 - (this.reloadTimeLeft / this.reloadTime));

      emitEvent(this.scene, Weapon.Events.Reloading.Local, {
        playerId: this.playerId,
        weaponId: this.id,
        progress: this.reloadProgress
      });

      if (this.reloadProgress === 1) {
        this.endReload();
      }
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
      this.container.setRotation(this.weaponAngle);
    } else {
      // Полностью выравниваем оружие
      this.weaponAngle = 0;
      this.container.setRotation(0);
    }
  }

  public setDepth(depth: number): this {
    this.container.setDepth(depth);
    return this;
  }

  public setPosition(x: number, y: number, direction: number): this {
    this.direction = direction;
    const offsetX = this.options?.texture.offset.x || 0;
    const offsetY = this.options?.texture.offset.y || 0;

    this.x = x + offsetX;
    this.y = y + offsetY;
    this.container.setPosition(this.x, this.y);

    if (this.sight) {
      const { innerX, innerY } = this.getFirePoint();
      this.sight.setPosition(innerX, innerY, direction);
    }

    return this;
  }

  // Метод для сброса блокировки выстрела (вызывается при отпускании кнопки)
  public resetTrigger(): void {
    this.canFireAgain = true;
  }

  public updateSightState(): void {
    if (this.sight) {
      if (this.options.hideSightWhenCantFire) {
        this.sight.setActive(this.canFire(this.scene.time.now));
      } else {
        this.sight.setActive(this.currentAmmo > 0);
      }
    }
  }

  /**
   * Выбрасывает гильзу после выстрела
   * @param x Координата X точки выброса
   * @param y Координата Y точки выброса
   * @param direction Направление выстрела (1 вправо, -1 влево)
   */
  protected ejectShellCasing(x: number, y: number, direction: number): void {
    if (!this.settingsService.getValue('shellCasingsEnabled')) {
      return;
    }
    const matrix = this.gameObject.getWorldTransformMatrix();
    new ShellCasingEntity(this.scene, matrix.tx, y, direction);
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
  private applyWeaponTilt(angle: number): void {
    this.weaponAngle = angle;
    this.container.setRotation(angle);
  }
}