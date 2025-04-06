import * as Phaser from 'phaser';
import { WeaponType } from '../core/Constants';
import { BaseWeapon } from './BaseWeapon';
import { BaseBullet } from './BaseBullet';
import { GameplayScene } from '../scenes/GameplayScene';

export class Pistol extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    super(scene, WeaponType.PISTOL, {
      fireRate: 2,
      damage: 10,
      range: 300,
      bulletSpeed: 2000,
      magazineSize: 10,
      reloadTime: 1000
    });
    
    // Инициализируем спрайт пистолета
    this.sprite = scene.add.sprite(0, 0, 'weapon_placeholder');
  }

  fire(x: number, y: number): BaseBullet | null {
    const targetX = x + 1000;
    const targetY = y;
    
    if (!this.canFire(this.scene.time.now)) return null;
    
    this.lastFired = this.scene.time.now;
    this.currentAmmo--;
    
    // Отладочная информация
    console.log(`Пистолет выстрелил из (${x}, ${y}) в (${targetX}, ${targetY})`);
    
    // Создаем пулю
    const bullet = new BaseBullet(this.scene, x, y, 'bullet_placeholder');
    
    // Передаем пулю в группу bullets сцены GameplayScene
    if (this.scene instanceof GameplayScene) {
      const gameScene = this.scene as GameplayScene;
      gameScene.getBulletsGroup().add(bullet.getSprite());
    }
    
    // Устанавливаем параметры пули - передаем целевые координаты, а не направление
    bullet.fire(x, y, targetX, targetY, this.stats.bulletSpeed, this.stats.damage, this.stats.range);
    
    // Если кончились патроны, перезаряжаем
    if (this.currentAmmo <= 0) {
      this.reload();
    }
    
    return bullet;
  }
} 