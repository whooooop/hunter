import * as Phaser from 'phaser';
import { WeaponType } from '../core/Constants';
import { BaseBullet } from './BaseBullet';

export interface WeaponStats {
  fireRate: number;     // Выстрелов в секунду
  damage: number;       // Урон от одного выстрела
  range: number;        // Дальность стрельбы
  bulletSpeed: number;  // Скорость пули
  magazineSize: number; // Размер магазина
  reloadTime: number;   // Время перезарядки в мс
}

export class BaseWeapon {
  protected scene: Phaser.Scene;
  protected type: WeaponType;
  protected stats: WeaponStats;
  protected sprite: Phaser.GameObjects.Sprite | null = null;
  
  protected lastFired: number = 0;
  protected isReloading: boolean = false;
  protected currentAmmo: number;

  constructor(scene: Phaser.Scene, type: WeaponType, stats: WeaponStats) {
    this.scene = scene;
    this.type = type;
    this.stats = stats;
    this.currentAmmo = stats.magazineSize;
  }

  public getType(): WeaponType {
    return this.type;
  }

  public getStats(): WeaponStats {
    return this.stats;
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public canFire(time: number): boolean {
    // Если перезаряжаемся, стрелять нельзя
    if (this.isReloading) return false;
    
    // Если нет патронов, стрелять нельзя
    if (this.currentAmmo <= 0) return false;
    
    // Проверяем, прошло ли достаточно времени с последнего выстрела
    const timeBetweenShots = 1000 / this.stats.fireRate;
    return time - this.lastFired >= timeBetweenShots;
  }

  public reload(): void {
    if (this.isReloading || this.currentAmmo === this.stats.magazineSize) return;
    
    console.log(`Перезарядка оружия: ${this.type}`);
    this.isReloading = true;
    
    // Устанавливаем таймер на перезарядку
    this.scene.time.delayedCall(this.stats.reloadTime, () => {
      this.currentAmmo = this.stats.magazineSize;
      this.isReloading = false;
      console.log(`Перезарядка завершена. Патроны: ${this.currentAmmo}`);
    });
  }

  public fire(x: number, y: number): BaseBullet | null {
    // Этот метод должен быть переопределен в наследниках
    console.warn('Метод fire() должен быть переопределен');
    return null;
  }

  public update(time: number, delta: number): void {
    // Обновление состояния оружия
  }
} 