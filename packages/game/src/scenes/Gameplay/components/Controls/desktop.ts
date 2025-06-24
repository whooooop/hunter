import { FONT_FAMILY } from "../../../../config";
import { ControlsViewBase } from "./base";
import { actionButton } from "./buttons";
import { moveTitleText } from "./translates";

export class DesktopControlsView extends ControlsViewBase {

  private movementContainer!: Phaser.GameObjects.Container;
  private actionContainer!: Phaser.GameObjects.Container;

  private containerOffsetX: number = 0;
  private containerOffsetY: number = 60;
  private containerWidth: number = 500;
  private containerHeight: number = 600;
  private containerAlpha: number = 0.4;

  private movementContainerX: number = this.containerWidth + 140 + 20;
  private actionContainerX: number = 120;

  constructor(
    scene: Phaser.Scene
  ) {
    super(scene, 0, 0);
    this.renderMovement();
    this.renderActionButtons();
  }

  show(): Promise<void> {
    const duration = 800;
    const ease = 'Quint.easeInOut';

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.movementContainer,
        x: this.movementContainerX,
        duration,
        ease
      });

      this.scene.tweens.add({
        targets: this.actionContainer,
        x: this.actionContainerX,
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
        targets: this.movementContainer,
        x: this.movementContainerX + this.containerWidth * 2,
        duration,
        ease
      });

      this.scene.tweens.add({
        targets: this.actionContainer,
        x: this.actionContainerX - this.containerWidth * 2,
        duration,
        ease,
        onComplete: () => resolve()
      });
    });
  }

  renderMovement(): void {
    this.movementContainer = this.scene.add.container(this.movementContainerX + this.containerWidth * 2, this.containerOffsetY);
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, this.containerAlpha);
    overlay.fillRoundedRect(0, 0, this.containerWidth, this.containerHeight, 8);
    this.movementContainer.add(overlay);

    const moveTitle = this.scene.add.text(this.containerWidth / 2, this.containerHeight - 120, moveTitleText.translate, {
      fontSize: 40,
      fontFamily: FONT_FAMILY.BOLD,
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5).setWordWrapWidth(this.containerWidth - 200);
    this.movementContainer.add(moveTitle);

    const y = this.containerHeight / 2 - 150;
    const x = this.containerWidth / 2;
    const offset = 140;

    const upButton = this.createMovementButton(x, y, '↑', 'W');
    this.movementContainer.add(upButton);

    const downButton = this.createMovementButton(x, y + offset, '↓', 'S');
    this.movementContainer.add(downButton);

    const leftButton = this.createMovementButton(x - offset, y + offset, '←', 'A');
    this.movementContainer.add(leftButton);

    const rightButton = this.createMovementButton(x + offset, y + offset, '→', 'D');
    this.movementContainer.add(rightButton);

    this.add(this.movementContainer);
  }

  renderActionButtons(): void {
    this.actionContainer = this.scene.add.container(this.actionContainerX - this.containerWidth * 2, this.containerOffsetY);
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, this.containerAlpha);
    overlay.fillRoundedRect(0, 0, this.containerWidth, this.containerHeight, 8);
    this.actionContainer.add(overlay);

    let x = 80;
    let y = 60;

    for (const button of actionButton) {
      const buttonContainer = this.createButton(x, y, button.key, button.title.translate, button.description?.translate);
      this.actionContainer.add(buttonContainer);
      y += 80;
    }
    this.add(this.actionContainer);
  }

  createButton(x: number, y: number, key: string, title: string, description?: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const size = 66;
    const offset = 20;
    const fontSize = key.length > 1 ? 16 : 30;

    const keyBg = this.scene.add.graphics();
    keyBg.fillStyle(0x000000, 1);
    keyBg.lineStyle(1, 0x333333);
    keyBg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    keyBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    container.add(keyBg);

    const keyText = this.scene.add.text(0, 0, key, {
      fontSize: fontSize,
      fontFamily: FONT_FAMILY.BOLD,
      color: '#fff'
    }).setOrigin(0.5);
    container.add(keyText);

    const text = this.scene.add.text(size / 2 + offset, description ? -14 : 0, title, {
      fontSize: 20,
      fontFamily: FONT_FAMILY.BOLD,
      color: '#fff'
    }).setOrigin(0, 0.5);
    container.add(text);

    if (description) {
      const descriptionText = this.scene.add.text(size / 2 + offset, 14, description, {
        fontSize: 16,
        fontFamily: FONT_FAMILY.REGULAR,
        color: '#fff'
      }).setOrigin(0, 0.5);
      container.add(descriptionText);
    }

    return container;
  }

  createMovementButton(x: number, y: number, key: string, key2: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const size = 110;
    const fontSize = 32;

    const keyBg = this.scene.add.graphics();
    keyBg.fillStyle(0x000000, 1);
    keyBg.lineStyle(1, 0x333333);
    keyBg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    keyBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    container.add(keyBg);

    const keyText = this.scene.add.text(-size / 4, -size / 4, key, {
      fontSize: fontSize,
      fontFamily: FONT_FAMILY.BOLD,
      color: '#fff'
    }).setOrigin(0.5);
    container.add(keyText);

    const separator = this.scene.add.text(0, 0, ' / ', {
      fontSize: fontSize * 2,
      fontFamily: FONT_FAMILY.REGULAR,
      color: '#fff'
    }).setOrigin(0.5);
    container.add(separator);

    const key2Text = this.scene.add.text(size / 4, size / 4, key2, {
      fontSize: fontSize,
      fontFamily: FONT_FAMILY.BOLD,
      color: '#fff'
    }).setOrigin(0.5);
    container.add(key2Text);

    return container;
  }
}