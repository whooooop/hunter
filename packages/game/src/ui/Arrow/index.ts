import { preloadImage } from "../../preload";
import arrow from './assets/arrow.png';

const texture = {
  key: 'arrow',
  url: arrow,
  scale: 0.46,
}

export class UiArrow extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture.key);
    this.setScale(texture.scale);
  }

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, { key: texture.key, url: texture.url! });
  }
}