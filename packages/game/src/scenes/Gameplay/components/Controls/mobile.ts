import { FONT_FAMILY } from "../../../../config";
import { mobileChangeWeaponArea, mobileFireArea, mobileMoveArea } from "../../../../mobile.controls.config";
import { hexToNumber } from "../../../../utils/colors";
import { ControlsViewBase } from "./base";
import { changeWeaponText } from "./translates";

const textColor = '#343434';
const dashedColor = '#a9c5b4';
const offset = 20;
const dashLength = 10;
const gapLength = 10;
const lineWidth = 3;

export class MobileControlsView extends ControlsViewBase {

  private movementContainer!: Phaser.GameObjects.Container;
  private actionContainer!: Phaser.GameObjects.Container;

  private moveArea!: Phaser.GameObjects.Container;
  private fireArea!: Phaser.GameObjects.Container;
  private changeWeaponArea!: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene
  ) {
    super(scene, 0, 0);
    this.createJoystickArea();
    this.createFireArea();
    this.createChangeWeaponArea();
  }

  show(): Promise<void> {
    const duration = 800;
    const ease = 'Quint.easeInOut';
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [this.moveArea, this.changeWeaponArea, this.fireArea],
        alpha: 1,
        duration,
        ease,
        onComplete: () => resolve()
      });
    });
  }

  hide(): Promise<void> {
    const duration = 800;
    const ease = 'Quint.easeInOut';
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [this.moveArea, this.changeWeaponArea, this.fireArea],
        alpha: 0,
        duration,
        ease,
        onComplete: () => resolve()
      });
    });
  }

  private createJoystickArea(): void {
    this.moveArea = this.scene.add.container(mobileMoveArea.x + offset, mobileMoveArea.y).setAlpha(0);
    const area = this.createDashedRectangle(0, 0, mobileMoveArea.width - offset, mobileMoveArea.height - offset, {
      dashLength,
      gapLength,
      lineWidth,
      color: textColor
    });
    this.moveArea.add(area);
    this.add(this.moveArea);
  }

  private createFireArea(): void {
    this.fireArea = this.scene.add.container(mobileFireArea.x, mobileFireArea.y).setAlpha(0);
    const area = this.createDashedRectangle(0, 0, mobileFireArea.width - offset, mobileFireArea.height - offset, {
      dashLength,
      gapLength,
      lineWidth,
      color: textColor
    });
    this.fireArea.add(area);
    this.add(this.fireArea);
  }

  private createChangeWeaponArea(): void {
    this.changeWeaponArea = this.scene.add.container(mobileChangeWeaponArea.x, mobileChangeWeaponArea.y).setAlpha(0);
    const changeWeaponArea = this.createDashedRectangle(0, 0, mobileChangeWeaponArea.width - offset, mobileChangeWeaponArea.height - offset, {
      dashLength,
      gapLength,
      lineWidth,
      color: textColor,
      radius: 20
    });

    const changeWeaponTextElement = this.scene.add.text(mobileChangeWeaponArea.width / 2, mobileChangeWeaponArea.height / 2, changeWeaponText.translate.toUpperCase(), {
      fontSize: 26,
      fontFamily: FONT_FAMILY.BOLD,
      color: textColor.toString()
    }).setOrigin(0.5).setWordWrapWidth(mobileChangeWeaponArea.width - 200).setAlign('center');

    this.changeWeaponArea.add(changeWeaponArea);
    this.changeWeaponArea.add(changeWeaponTextElement);
    this.add(this.changeWeaponArea);
  }

  private createDashedRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      dashLength?: number;
      gapLength?: number;
      lineWidth?: number;
      color?: string;
      alpha?: number;
      radius?: number;
      depth?: number;
    } = {}
  ): Phaser.GameObjects.Graphics {
    const {
      dashLength = 10,
      gapLength = 10,
      lineWidth = 3,
      color = dashedColor,
      alpha = 1,
      radius = 20,
      depth = 1000
    } = options;

    const graphics = this.scene.add.graphics();
    graphics.setDepth(depth);
    graphics.lineStyle(lineWidth, hexToNumber(color), alpha);

    const drawDashedLine = (startX: number, startY: number, endX: number, endY: number) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dashCount = Math.floor(distance / (dashLength + gapLength));
      const dashRatio = dashLength / (dashLength + gapLength);

      for (let i = 0; i < dashCount; i++) {
        const start = i * (dashLength + gapLength);
        const end = start + dashLength;
        const startRatio = start / distance;
        const endRatio = end / distance;

        const dashStartX = startX + dx * startRatio;
        const dashStartY = startY + dy * startRatio;
        const dashEndX = startX + dx * endRatio;
        const dashEndY = startY + dy * endRatio;

        graphics.moveTo(dashStartX, dashStartY);
        graphics.lineTo(dashEndX, dashEndY);
      }
    };

    const drawRoundedCorner = (centerX: number, centerY: number, startAngle: number, endAngle: number) => {
      const segments = 8;
      const angleStep = (endAngle - startAngle) / segments;

      for (let i = 0; i < segments; i++) {
        const currentAngle = startAngle + i * angleStep;
        const nextAngle = currentAngle + angleStep;

        if (i % 2 === 0) { // Рисуем только штрихи
          const x1 = centerX + radius * Math.cos(currentAngle);
          const y1 = centerY + radius * Math.sin(currentAngle);
          const x2 = centerX + radius * Math.cos(nextAngle);
          const y2 = centerY + radius * Math.sin(nextAngle);

          graphics.moveTo(x1, y1);
          graphics.lineTo(x2, y2);
        }
      }
    };

    drawDashedLine(x + radius, y, x + width - radius, y);
    drawDashedLine(x + width, y + radius, x + width, y + height - radius);
    drawDashedLine(x + width - radius, y + height, x + radius, y + height);
    drawDashedLine(x, y + height - radius, x, y + radius);

    drawRoundedCorner(x + radius, y + radius, Math.PI, Math.PI * 1.5);
    drawRoundedCorner(x + width - radius, y + radius, Math.PI * 1.5, Math.PI * 2);
    drawRoundedCorner(x + width - radius, y + height - radius, 0, Math.PI * 0.5);
    drawRoundedCorner(x + radius, y + height - radius, Math.PI * 0.5, Math.PI);

    graphics.strokePath();
    return graphics;
  }
}