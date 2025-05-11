import { DISPLAY } from '../../config';
import { UiButton } from '../Button';
import backButtonTexture from './back.png';

const texture = {
  key: 'backButton',
  url: backButtonTexture,
  scale: 0.5,
}

export class UiBackButton extends UiButton {
  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture.key, texture.url);
    UiButton.preload(scene);
  }

  constructor(scene: Phaser.Scene, x: number = 80, y: number = DISPLAY.HEIGHT - 80) {
    super(scene, x, y, texture);
  }
}