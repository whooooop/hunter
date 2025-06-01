import { preloadImage } from '../../preload';
import { UiButton } from '../Button';
import shopButtonTextureUrl from './shop.png';

const texture = {
  key: 'shopButton',
  url: shopButtonTextureUrl,
  scale: 0.5,
}

export class UiShopButton extends UiButton {
  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, texture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture);
  }
}