import { preloadImage } from '../../preload';
import { UiButton } from '../Button';
import shopButtonTextureUrl from './shop.png';

const texture = {
  key: 'shopButton',
  url: shopButtonTextureUrl,
  scale: 0.5,
}

export class UiShopButton extends UiButton {
  private isVisible: boolean = true;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, texture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture);
  }

  public show(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1 * texture.scale,
      duration: 100,
      ease: 'Power2',
    });
  }

  public hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5 * texture.scale,
      duration: 100,
      ease: 'Power2',
    });
  }
}