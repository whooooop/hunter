import playButtonTextureUrl from './play_button.png';
import { UiButton } from '../Button';

const texture = {
  key: 'playButton',
  url: playButtonTextureUrl,
  scale: 0.5,
}

export class UiPlayButton extends UiButton {
  static preload(scene: Phaser.Scene): void {
    UiButton.preload(scene);
    scene.load.image(texture.key, texture.url);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture);
  }
}