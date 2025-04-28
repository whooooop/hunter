import { hexToNumber } from '../../utils/colors';
import { createSpriteAnimation } from '../../utils/sprite';
import muzzleFlashUrl from './assets/muzzleFlash.png';

export const MuzzleFlashTexture = {
  key: 'muzzle_flash',
  url: muzzleFlashUrl,
  frameWidth: 179,
  frameHeight: 117,
  frameRate: 60,
  startFrame: 0,
  endFrame: 3,
  repeat: 0,
}

export class MuzzleFlash {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, config: { scale: number }) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.sprite = scene.add.sprite(0, 0, MuzzleFlashTexture.key, MuzzleFlashTexture.endFrame);
    this.sprite.setOrigin(0, 0.5).setScale(config.scale);

    // const graphics = scene.add.graphics();
    // graphics.fillStyle(hexToNumber('#000000'));
    // graphics.fillRect(0, 0, 2, 2);
    // this.container.add(graphics);
    
    createSpriteAnimation(scene, MuzzleFlashTexture);

    this.container.add(this.sprite);
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public play(): void {
    this.sprite.play(MuzzleFlashTexture.key, true);
  }
}

