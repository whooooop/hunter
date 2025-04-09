import * as Phaser from 'phaser';
import { hexToRgb } from '../../utils/colors';
import { createLogger } from '../../utils/logger';

interface WeaponSightOptions {
  lineThickness: number;
  lineLength: number;
  gapSize: number;
  alpha: number;
  color: number;
  range: number;
  emptyColor: number;
}

const defaultOptions: Required<WeaponSightOptions> = {
  lineThickness: 1,
  lineLength: 10,
  gapSize: 4,
  alpha: 0.9,
  color: hexToRgb('#000000'),
  emptyColor: hexToRgb('#ff0000'),
  range: 150
};

const logger = createLogger('WeaponSight');

export class WeaponSight {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private range: number;
  private color: number;
  private options: Required<WeaponSightOptions>;

  constructor(scene: Phaser.Scene, options?: WeaponSightOptions) {
    this.scene = scene;
    this.options = {...defaultOptions, ...options};
    this.color = this.options.color;
    this.range = this.options.range;
    // Создаем графический объект для прицела
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(1000); // Устанавливаем высокую глубину отображения
  }

  public update(x: number, y: number, direction: number, hasAmmo: boolean): void {
    // Очищаем предыдущий прицел
    this.graphics.clear();
    
    // Устанавливаем цвет в зависимости от наличия патронов
    this.color = hasAmmo ? this.options.color : this.options.emptyColor;
    
    // Рисуем прицел
    this.drawSight(x, y, direction);
  }

  private drawSight(x: number, y: number, direction: number): void {
    const targetX = x + this.range * direction;
    // Устанавливаем стиль линии
    this.graphics.lineStyle(this.options.lineThickness, this.color, this.options.alpha);
    
    // Рисуем горизонтальные линии
    this.graphics.lineBetween(
      targetX - this.options.lineLength - this.options.gapSize,
      y,
      targetX - this.options.gapSize,
      y
    );
    
    this.graphics.lineBetween(
      targetX + this.options.gapSize,
      y,
      targetX + this.options.lineLength + this.options.gapSize,
      y
    );
    
    // Рисуем вертикальные линии
    this.graphics.lineBetween(
      targetX,
      y - this.options.lineLength - this.options.gapSize,
      targetX,
      y - this.options.gapSize
    );
    
    this.graphics.lineBetween(
      targetX,
      y + this.options.gapSize,
      targetX,
      y + this.options.lineLength + this.options.gapSize
    );
  }

  public destroy(): void {
    this.graphics.destroy();
  }
} 