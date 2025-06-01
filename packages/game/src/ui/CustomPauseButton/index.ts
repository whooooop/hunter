import * as Phaser from 'phaser';
import { emitEvent } from '../../GameEvents';
import { Game } from '../../types';

export class CustomPauseButton extends Phaser.GameObjects.Container {
  private leftBar!: Phaser.GameObjects.Rectangle;
  private rightBar!: Phaser.GameObjects.Rectangle;
  private hitArea!: Phaser.GameObjects.Rectangle;

  private readonly BAR_WIDTH = 6;
  private readonly BAR_HEIGHT = 26;
  private readonly BAR_SPACING = 4;
  private readonly BUTTON_SIZE = 40; // Размер кликабельной области

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.createBars();
    this.setupInteractivity();

    scene.add.existing(this);
  }

  private createBars(): void {
    // Левая палочка
    this.leftBar = this.scene.add.rectangle(
      -this.BAR_SPACING / 2 - this.BAR_WIDTH / 2,
      0,
      this.BAR_WIDTH,
      this.BAR_HEIGHT,
      0xFFFFFF
    );
    this.leftBar.setStrokeStyle(1, 0x000000);
    // Правая палочка  
    this.rightBar = this.scene.add.rectangle(
      this.BAR_SPACING / 2 + this.BAR_WIDTH / 2,
      0,
      this.BAR_WIDTH,
      this.BAR_HEIGHT,
      0xFFFFFF
    );
    this.rightBar.setStrokeStyle(1, 0x000000);
    // Невидимая область для кликов (больше самих палочек для удобства)
    this.hitArea = this.scene.add.rectangle(0, 0, this.BUTTON_SIZE, this.BUTTON_SIZE, 0x000000, 0);

    this.add([this.hitArea, this.leftBar, this.rightBar]);
  }

  private setupInteractivity(): void {
    this.hitArea.setInteractive();

    this.hitArea.on('pointerdown', () => {
      // Эффект нажатия - слегка уменьшаем палочки
      this.leftBar.setScale(0.9);
      this.rightBar.setScale(0.9);

      // Вызываем событие паузы
      emitEvent(this.scene, Game.Events.Pause.Local, {});
    });

    this.hitArea.on('pointerup', () => {
      // Возвращаем нормальный размер
      this.leftBar.setScale(1);
      this.rightBar.setScale(1);
    });

    this.hitArea.on('pointerover', () => {
      // Эффект наведения - делаем палочки немного больше и прозрачнее
      this.leftBar.setScale(1.1);
      this.rightBar.setScale(1.1);
      this.leftBar.setAlpha(0.8);
      this.rightBar.setAlpha(0.8);
    });

    this.hitArea.on('pointerout', () => {
      // Возвращаем нормальное состояние
      this.leftBar.setScale(1);
      this.rightBar.setScale(1);
      this.leftBar.setAlpha(1);
      this.rightBar.setAlpha(1);
    });
  }
} 