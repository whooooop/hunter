import { settings } from '../../settings';
import backButtonTexture from './back.png';

const texture = {
  key: 'backButton',
  url: backButtonTexture,
  scale: 0.5,
}

export class UiBackButton extends Phaser.GameObjects.Image {
  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture.key, texture.url);
  }

  constructor(scene: Phaser.Scene, x: number = 80, y: number = settings.display.height - 80) {
    super(scene, x, y, texture.key);
    this.setScale(texture.scale);
    this.setInteractive();
    this.on('pointerdown', () => {
      this.setScale(texture.scale * 1); 
    });
    this.on('pointerup', () => {
      this.setScale(texture.scale * 1.1);
    });
    this.on('pointerover', () => {
      this.setScale(texture.scale * 1.1);
    });
    this.on('pointerout', () => {
      this.setScale(texture.scale * 1);
    });
  }
}