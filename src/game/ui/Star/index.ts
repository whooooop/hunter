import { preloadImage } from '../../core/preload';
import starTextureUrl from './star.png';

const texture = {
  key: 'star',
  url: starTextureUrl,
  scale: 0.5,
}

export class UiStar extends Phaser.GameObjects.Container {
  private starsOffset = [
    { x: 0, y: 0 },
    { x: 25, y: 20 },
    { x: -4, y: 30 },
  ];

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, texture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, count: number) {
    super(scene, x, y);

    const offsetY = count > 1 ? -15 : 0; 

    for (let i = 0; i < count; i++) {
      const star = scene.add.image(this.starsOffset[i].x, this.starsOffset[i].y + offsetY, texture.key).setScale(texture.scale).setOrigin(0.5);
      this.add(star);
    }
  }
}