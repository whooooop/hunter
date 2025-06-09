import { ClickSound, preloadClickSound } from '../../audio/click';
import { preloadImage } from '../../preload';
import { AudioService } from '../../services/AudioService';
import closeUrl from './assets/close.png';
import openUrl from './assets/open.png';

const OPEN_TEXTURE = {
  key: 'button_fullscreen_open',
  url: openUrl,
  scale: 0.5
};

const CLOSE_TEXTURE = {
  key: 'button_fullscreen_close',
  url: closeUrl,
  scale: 0.5
};

export class UiFullscreen extends Phaser.GameObjects.Image {
  private fullscreen: boolean = false;
  private textureAsset!: { key: string, url: string, scale: number };
  private buttonScale: number = 1;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, { url: OPEN_TEXTURE.url, key: OPEN_TEXTURE.key });
    preloadImage(scene, { url: CLOSE_TEXTURE.url, key: CLOSE_TEXTURE.key });
    preloadClickSound(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    this.fullscreen = false;
    this.updateTexture();
    this.setInteractive();

    let hoverTweenX: Phaser.Tweens.Tween | null = null;
    let hoverTweenY: Phaser.Tweens.Tween | null = null;

    this.on('pointerdown', () => {
      if (!scene.scale.isFullscreen) {
        scene.scale.startFullscreen();
      } else {
        scene.scale.stopFullscreen();
      }
      AudioService.playAudio(scene, ClickSound.key);
    });

    this.on('pointerover', () => {
      if (hoverTweenX) hoverTweenX.stop();
      if (hoverTweenY) hoverTweenY.stop();
      hoverTweenX = scene.tweens.add({
        targets: this,
        scaleX: this.textureAsset.scale * 1.2 * this.buttonScale,
        duration: 120,
        yoyo: true,
        onComplete: () => {
          hoverTweenY = scene.tweens.add({
            targets: this,
            scaleY: this.textureAsset.scale * 1.2 * this.buttonScale,
            duration: 120,
            yoyo: true
          });
        }
      });
    });
    this.on('pointerout', () => {
      if (hoverTweenX) hoverTweenX.stop();
      if (hoverTweenY) hoverTweenY.stop();
      hoverTweenX = null;
      hoverTweenY = null;
      scene.tweens.add({
        targets: this,
        scaleX: this.textureAsset.scale * this.buttonScale,
        scaleY: this.textureAsset.scale * this.buttonScale,
        duration: 100
      });
    });
  }

  setButtonScale(scale: number): this {
    this.buttonScale = scale;
    this.updateTexture();
    return this;
  }

  private updateTexture(): void {
    this.textureAsset = this.fullscreen ? OPEN_TEXTURE : CLOSE_TEXTURE;
    this.setTexture(this.textureAsset.key);
    this.setScale(this.textureAsset.scale * this.buttonScale);
  }
}