import { ClickSound, preloadClickSound } from '../../../../audio/click';
import { DISPLAY, FONT_FAMILY } from '../../../../config';
import { preloadImage } from '../../../../preload';
import { AudioService } from '../../../../services/AudioService';
import { StartGameButtonTexture } from './textures';
import { readyText, startGameText, waitingText } from './translate';

const showY: number = DISPLAY.HEIGHT - 100;
const hideY: number = DISPLAY.HEIGHT + 100;

export class UiStartGameButton extends Phaser.GameObjects.Container {
  private isHostMode: boolean = false;
  private disabled: boolean = false;
  private text: Phaser.GameObjects.Text;
  private button: Phaser.GameObjects.Image;

  static preload(scene: Phaser.Scene): void {
    preloadClickSound(scene);
    preloadImage(scene, { key: StartGameButtonTexture.key, url: StartGameButtonTexture.url! });
  }

  constructor(scene: Phaser.Scene) {
    super(scene, DISPLAY.WIDTH / 2, hideY);

    this.text = this.scene.add.text(0, 0, '', { fontSize: 18, color: '#ffffff', align: 'center', fontFamily: FONT_FAMILY.BOLD }).setOrigin(0.5);
    this.button = this.scene.add.image(0, 0, StartGameButtonTexture.key).setScale(StartGameButtonTexture.scale);
    this.button.setInteractive();

    this.add(this.button);
    this.add(this.text);

    this.updateState();
  }

  setHostMode(value: boolean): void {
    this.isHostMode = value;
    this.updateState();
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
    this.updateState();
  }

  private updateState(): void {
    if (this.isHostMode) {
      if (!this.disabled) {
        this.text.setText(startGameText.translate.toUpperCase());
      } else {
        this.text.setText(waitingText.translate.toUpperCase());
      }
    } else {
      this.text.setText(readyText.translate.toUpperCase());
    }
  }

  onClick(callback: () => void): void {
    this.button.on('pointerdown', () => {
      if (!this.disabled) {
        AudioService.playAudio(this.scene, ClickSound.key);
        callback();
      }
    });
  }

  show(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        duration: 600,
        y: showY,
        ease: 'Quint.easeInOut',
        onComplete: () => resolve()
      });
    });
  }

  hide(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        duration: 600,
        y: hideY,
        ease: 'Quint.easeInOut',
        onComplete: () => resolve()
      });
    });
  }
}