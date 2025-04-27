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
import { emitEvent, offEvent, onEvent } from "../Events";
import { Weapon, FireParams, AudioAssets } from "../types/weaponTypes";
import { sleep } from '../../../utils/sleep';

const logger = createLogger('WeaponEntity');

export class WeaponEntity {
  private id: string; 
  private name: string;
  private active: boolean = false;
  private scene: Phaser.Scene;
  private gameObject: Phaser.GameObjects.Sprite;

  protected lastFired: number = 0;
  protected lastEmptySoundTime: number = 0;

  protected isReloading: boolean = false;
  protected isBolt: boolean = false;

  protected currentAmmo: number = 0;
  protected canFireAgain: boolean = true; // Флаг для неавтоматического оружия
  protected weaponAngle: number = 0; // Текущий угол наклона оружия
  protected options: Weapon.Config;

  private container: Phaser.GameObjects.Container;
  private debugFirePoint!: Phaser.GameObjects.Ellipse;

  private debug: boolean = false;

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

  constructor(scene: Phaser.Scene, id: string, options: Weapon.Config) {
    this.id = id;
    this.scene = scene;
    this.name = options.name;
    this.options = options;
    this.currentAmmo = this.options.magazineSize;

    this.gameObject = this.scene.add.sprite(0, 0, this.options.texture.key);
    this.gameObject.setScale(this.options.texture.scale);
    this.container = scene.add.container(0, 0);
    this.container.add(this.gameObject);
    this.scene.add.existing(this.container);

    if (this.debug) {
      this.debugFirePoint = this.scene.add.ellipse(0, 0, 10, 10, 0x0000ff);
      this.container.add(this.debugFirePoint);
    }

    if (this.options.sight) {
      this.createSight(this.options.sight)
    }

    this.createAudioAssets();

    onEvent(this.scene, Weapon.Events.FireAction.Remote, this.handleFireAction, this);
  }

  public getGameObject(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container {
    return this.container;
  }

  private handleFireAction({ playerId, weaponId, originPoint, targetPoint, angleTilt }: Weapon.Events.FireAction.Payload): void {
    if (weaponId == this.id) {
      this.fireAction(playerId, originPoint, targetPoint, angleTilt);
    }
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

  protected createAudioAssets(): void {
    if (this.options.fireAudio) {
      this.audioAssets.fire = this.scene.sound.add(this.options.fireAudio.key, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.emptyAudio) {
      this.audioAssets.empty = this.scene.sound.add(this.options.emptyAudio.key, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.reloadAudio) {
      this.audioAssets.reload = this.scene.sound.add(this.options.reloadAudio.key, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.boltAudio) {
      this.audioAssets.bolt = this.scene.sound.add(this.options.boltAudio.key, { volume: settings.audio.weaponsVolume });
    }
    if (this.options.reloadItemAudio) {
      this.audioAssets.reloadItem = this.scene.sound.add(this.options.reloadItemAudio.key, { volume: settings.audio.weaponsVolume });
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

    emitEvent(this.scene, Weapon.Events.ReloadAction.Local, {
      playerId: this.id,
      weaponId: this.id,
    });
    this.reloadAction();
  }

  private async reloadAction(): Promise<void> {
    this.isReloading = true;

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
      this.currentAmmo = this.options.magazineSize;
      this.isReloading = false;
      this.gameObject.setVisible(true);
      this.updateSightState();
      this.belt();
    });
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

    emitEvent(this.scene, Weapon.Events.FireAction.Local, { 
      weaponId: this.id,
      playerId,
      originPoint,
      targetPoint,
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
        targetPoint
      });
    }

    // Создаем гильзу после выстрела
    if (this.options.shellCasings && this.scene instanceof GameplayScene) {
      this.ejectShellCasing(originPoint.x, originPoint.y, this.direction);
    }

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

  protected playReloadItemSound(): void {
    if (this.audioAssets.reloadItem) {
      this.audioAssets.reloadItem.play();
    }
  }

  // Звук выстрела
  protected playFireSound(): void {
    if (this.audioAssets.fire) {
      this.audioAssets.fire.play();
    }
  }

  // Звук затвора (взводной механизм)
  protected playBoltSound(): void {
    if (this.audioAssets.bolt) {
      this.audioAssets.bolt.play();
    }
  }

  public update(time: number, delta: number): void {
    // Постепенно возвращаем оружие в нормальное положение
    this.updateWeaponTilt(time, delta);

    if (this.debugFirePoint) {
      const { innerX, innerY } = this.getFirePoint();
      this.debugFirePoint.setDepth(1000).setPosition(innerX, innerY);
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
    // Проверяем, включена ли функция отображения гильз
    if (!settings.gameplay.shellCasings.enabled) {
      return;
    }
    
    new ShellCasingEntity(this.scene, x, y, direction);
  }

  public destroy(): void {
    if (this.sight) {
      this.sight.destroy();
      this.sight = null;
    }

    offEvent(this.scene, Weapon.Events.FireAction.Remote, this.handleFireAction, this);
  }

  /**
   * Применяет случайный наклон к оружию после выстрела
   */
  private applyWeaponTilt(angle: number): void {
    this.weaponAngle = angle;
    this.gameObject.setRotation(angle);
  }
}