import { UiButton } from '../Button';
import videoButtonTextureUrl from './video_button.png';

const texture = {
  key: 'videoButton',
  url: videoButtonTextureUrl,
  scale: 0.5,
}

export class UiVideoButton extends UiButton {
  static preload(scene: Phaser.Scene): void {
    UiButton.preload(scene);
    scene.load.image(texture.key, texture.url);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture);
  }
}