import starsTextureUrl from './stars.png';
import { UiStar } from '../Star';
import { FONT_FAMILY } from '../../config';
import { preloadImage } from '../../core/preload';

const texture = {
  key: 'stars',
  url: starsTextureUrl,
  scale: 0.5,
}

export class UiStars extends Phaser.GameObjects.Container {
  private starCountText!: Phaser.GameObjects.Text;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, texture);
    UiStar.preload(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y);

    const stars = this.scene.add.image(0, 0, texture.key).setScale(texture.scale).setOrigin(0.5);
    const star = new UiStar(scene, -92, 2, 1);
    this.starCountText = this.scene.add.text(30, 2, value.toString(), { fontSize: 20, color: '#fff', stroke: '#000', strokeThickness: 2, fontFamily: FONT_FAMILY.BOLD }).setOrigin(0.5);
    
    this.add(stars);
    this.add(star);
    this.add(this.starCountText);
  }

  setStars(value: number) {
    this.starCountText.setText(value.toString());
  }
}