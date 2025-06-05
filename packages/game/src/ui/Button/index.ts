import { ClickSound, preloadClickSound } from '../../audio/click';
import { AudioService } from '../../services/AudioService';

interface Texture {
  key: string;
  scale: number;
}

export class UiButton extends Phaser.GameObjects.Image {
  static preload(scene: Phaser.Scene): void {
    preloadClickSound(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: Texture) {
    super(scene, x, y, texture.key);

    this.setScale(texture.scale);
    this.setInteractive();

    let hoverTweenX: Phaser.Tweens.Tween | null = null;
    let hoverTweenY: Phaser.Tweens.Tween | null = null;

    this.on('pointerdown', () => {
      this.setScale(texture.scale * 1);
      AudioService.playAudio(scene, ClickSound);
    });
    this.on('pointerup', () => {
      this.setScale(texture.scale * 1.1);
    });
    this.on('pointerover', () => {
      if (hoverTweenX) hoverTweenX.stop();
      if (hoverTweenY) hoverTweenY.stop();
      this.setScale(texture.scale, texture.scale);
      hoverTweenX = scene.tweens.add({
        targets: this,
        scaleX: texture.scale * 1.2,
        duration: 120,
        yoyo: true,
        onComplete: () => {
          hoverTweenY = scene.tweens.add({
            targets: this,
            scaleY: texture.scale * 1.2,
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
        scaleX: texture.scale,
        scaleY: texture.scale,
        duration: 100
      });
    });
  }
}