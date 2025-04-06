import * as Phaser from 'phaser';
import { PhysicsObject } from '../core/PhysicsObject';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { Pistol } from '../weapons/Pistol';

export class Player extends PhysicsObject {
  name = 'Player';
  direction = 1;

  acceleration: number = 15;
  deceleration: number = 8;
  friction: number = 6;
  maxVelocityX: number = 300;
  maxVelocityY: number = 300;

  private weapon: BaseWeapon;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Настраиваем курсоры для управления
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    
    // Создаем стартовое оружие
    this.weapon = new Pistol(scene);
  }
  
  public update(time: number, delta: number): void {
    // Обрабатываем управление
    this.handleMovement();

    // Обрабатываем стрельбу
    this.handleFiring(time);
    
    super.update(time, delta);
  }
  
  private handleMovement(): void {
    if (this.cursors.left.isDown) {
      this.moveX = -1;
    } else if (this.cursors.right.isDown) {
      this.moveX = 1;
    } else {
      this.moveX = 0;
    }
    
    if (this.cursors.up.isDown) {
      this.moveY = -1;
    } else if (this.cursors.down.isDown) {
      this.moveY = 1;
    } else {
      this.moveY = 0;
    }
  }
  
  private handleFiring(time: number): void {
    if (this.fireKey.isDown) {
      // Направление стрельбы всегда вправо
      this.weapon.fire(this.sprite.x, this.sprite.y);
    }
  }
} 