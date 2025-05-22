import * as Phaser from 'phaser';
import { hexToNumber } from '../utils/colors';
import { createLogger } from '../utils/logger';
import { DISPLAY } from '../config';

const logger = createLogger('WeaponSight');

export enum WeaponSightType {
  RAY = 'ray',
  CROSSHAIR = 'crosshair',
}

export interface SightEntityOptions {
  type: WeaponSightType;
  lineThickness?: number;
  lineLength?: number;
  gapSize?: number;
  alpha?: number;
  color?: number;
  range?: number;
  emptyColor?: number;
}

const defaultOptions: Required<SightEntityOptions> = {
  type: WeaponSightType.CROSSHAIR,
  lineThickness: 1,
  lineLength: 10,
  gapSize: 4,
  alpha: 0.9,
  color: hexToNumber('#000000'),
  emptyColor: hexToNumber('#ff0000'),
  range: 150
};

export class SightEntity {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private range: number;
  private color: number;
  private options: Required<SightEntityOptions>;

  private x: number = 0;
  private y: number = 0;
  private active: boolean = false;
  private direction: number = 1;

  constructor(scene: Phaser.Scene, options?: SightEntityOptions) {
    this.scene = scene;
    this.options = {...defaultOptions, ...options};
    this.color = this.options.color;
    this.range = this.options.range;
    this.graphics = this.scene.add.graphics();
  }

  public getGameObject(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  public setPosition(x: number, y: number, direction: number): void {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.renderSight();
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.renderSight();
  }

  private renderSight(): void {
    // Очищаем предыдущий прицел
    this.graphics.clear();
    
    // Устанавливаем цвет в зависимости от наличия патронов
    this.color = this.active ? this.options.color : this.options.emptyColor;
    
    // Рисуем прицел
    this.drawSight();
  }

  private drawSight(): void {
    if (this.options.type === WeaponSightType.RAY) {
      if (this.active) {
        this.drawRay();
      }
    } else if (this.options.type === WeaponSightType.CROSSHAIR) {
      this.drawCrosshair();
    } 
  }

  private drawRay(): void {
    this.graphics.lineStyle(this.options.lineThickness, this.color, this.options.alpha);
    this.graphics.lineBetween(this.x, this.y, this.x + DISPLAY.WIDTH * this.direction, this.y);
  } 

  private drawCrosshair(): void {
    const targetX = this.x + this.range * this.direction;
    // Устанавливаем стиль линии
    this.graphics.lineStyle(this.options.lineThickness, this.color, this.options.alpha);
    
    // Рисуем горизонтальные линии
    this.graphics.lineBetween(
      targetX - this.options.lineLength - this.options.gapSize,
      this.y,
      targetX - this.options.gapSize,
      this.y
    );
    
    this.graphics.lineBetween(
      targetX + this.options.gapSize,
      this.y,
      targetX + this.options.lineLength + this.options.gapSize,
      this.y
    );
    
    // Рисуем вертикальные линии
    this.graphics.lineBetween(
      targetX,
      this.y - this.options.lineLength - this.options.gapSize,
      targetX,
      this.y - this.options.gapSize
    );
    
    this.graphics.lineBetween(
      targetX,
      this.y + this.options.gapSize,
      targetX,
      this.y + this.options.lineLength + this.options.gapSize
    );
  }

  public destroy(): void {
    this.graphics.destroy();
  }
} 