import { FONT_FAMILY } from "../../config";
import { preloadImage } from "../../preload";
import { clickAudio, UiButton } from "../Button";
import buttonTextActiveUrl from './assets/button_text_active.png';
import buttonTextBackgroundUrl from './assets/button_text_background.png';

const buttonTextBackgroundTexture = {
  url: buttonTextBackgroundUrl,
  key: 'button_text_background',
  scale: 0.5,
}

const buttonTextActiveTexture = {
  url: buttonTextActiveUrl,
  key: 'button_text_active',
  scale: 0.5,
}

export class UiButtonText extends Phaser.GameObjects.Container {

  private background: Phaser.GameObjects.Image;

  static preload(scene: Phaser.Scene): void {
    UiButton.preload(scene);
    preloadImage(scene, buttonTextBackgroundTexture);
    preloadImage(scene, buttonTextActiveTexture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, text?: string) {
    super(scene, x, y);

    this.background = scene.add.image(0, 0, buttonTextBackgroundTexture.key)
      .setScale(buttonTextBackgroundTexture.scale)
      .setInteractive();
    this.add(this.background);

    if (text) {
      const textElement = scene.add.text(0, 0, text, { fontSize: 30, fontFamily: FONT_FAMILY.REGULAR, color: '#000000' }).setOrigin(0.5);
      this.add(textElement);
    }

    this.background.on('pointerdown', () => {
      scene.sound.play(clickAudio.key);
    });
    this.background.on('pointerover', () => {
      this.background.setTexture(buttonTextActiveTexture.key);
    });
    this.background.on('pointerout', () => {
      this.background.setTexture(buttonTextBackgroundTexture.key);
    });
  }

  public onClick(callback: (...args: any[]) => void, context?: any): this {
    this.background.on('pointerdown', callback, context);
    return this;
  }
}