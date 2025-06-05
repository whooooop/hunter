import { ClickSound, preloadClickSound } from '../../audio/click';
import { preloadImage } from '../../preload';
import { AudioService } from '../../services/AudioService';
import audioUrl from './assets/audio.png';
import muteUrl from './assets/mute.png';

const MUTE_TEXTURE = {
  key: 'button_mute',
  url: muteUrl,
  scale: 0.5
};

const AUDIO_TEXTURE = {
  key: 'button_audio',
  url: audioUrl,
  scale: 0.5
};

export class UiMute extends Phaser.GameObjects.Image {
  private muted: boolean;
  private textureAsset!: { key: string, url: string, scale: number };

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, { url: MUTE_TEXTURE.url, key: MUTE_TEXTURE.key });
    preloadImage(scene, { url: AUDIO_TEXTURE.url, key: AUDIO_TEXTURE.key });
    preloadClickSound(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    this.muted = AudioService.getSettingsValue('muted') as boolean;;
    this.updateTexture();
    this.setInteractive();

    let hoverTweenX: Phaser.Tweens.Tween | null = null;
    let hoverTweenY: Phaser.Tweens.Tween | null = null;

    this.on('pointerdown', () => {
      this.muted = !this.muted;
      AudioService.setSettingsValue('muted', this.muted);
      this.updateTexture();
      AudioService.playAudio(scene, ClickSound);
    });

    this.on('pointerover', () => {
      if (hoverTweenX) hoverTweenX.stop();
      if (hoverTweenY) hoverTweenY.stop();
      hoverTweenX = scene.tweens.add({
        targets: this,
        scaleX: this.textureAsset.scale * 1.2,
        duration: 120,
        yoyo: true,
        onComplete: () => {
          hoverTweenY = scene.tweens.add({
            targets: this,
            scaleY: this.textureAsset.scale * 1.2,
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
        scaleX: this.textureAsset.scale,
        scaleY: this.textureAsset.scale,
        duration: 100
      });
    });
  }

  private updateTexture(): void {
    this.textureAsset = this.muted ? MUTE_TEXTURE : AUDIO_TEXTURE;
    this.setTexture(this.textureAsset.key);
    this.setScale(this.textureAsset.scale);
  }
}