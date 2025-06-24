import { ClickSound, preloadClickSound } from '../../audio/click';
import { FONT_FAMILY } from '../../config';
import { preloadImage } from '../../preload';
import { AudioService } from '../../services/AudioService';
import { StartGameButtonTexture } from './textures';

export class UiTimerButton extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private button: Phaser.GameObjects.Image;
  private timer: Phaser.Time.TimerEvent | null = null;
  private originalText: string;
  private timeout: number;
  private callback: () => void;

  static preload(scene: Phaser.Scene): void {
    preloadClickSound(scene);
    preloadImage(scene, { key: StartGameButtonTexture.key, url: StartGameButtonTexture.url! });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, timeout: number, callback: () => void) {
    super(scene, x, y);

    this.originalText = text;
    this.timeout = timeout;
    this.callback = callback;

    this.text = this.scene.add.text(0, 0, '', { fontSize: 18, color: '#ffffff', align: 'center', fontFamily: FONT_FAMILY.BOLD }).setOrigin(0.5);
    this.button = this.scene.add.image(0, 0, StartGameButtonTexture.key).setScale(StartGameButtonTexture.scale);
    this.button.setInteractive();

    this.add(this.button);
    this.add(this.text);

    this.button.on('pointerdown', () => {
      AudioService.playAudio(this.scene, ClickSound.key);
      callback();
    });

    this.updateText();
    this.startTimer();
  }

  setTimer(timeout: number): void {
    this.timeout = timeout;
    this.startTimer();
  }

  private updateText(): void {
    if (this.timeout > 0) {
      const seconds = Math.ceil(this.timeout / 1000);
      this.text.setText(`${this.originalText.toUpperCase()} (${seconds})`);
    } else {
      this.text.setText(this.originalText);
    }
  }

  private startTimer(): void {
    if (this.timeout <= 0) return;

    this.timer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true
    });
  }

  private onTimerTick(): void {
    this.timeout -= 1000;

    if (this.timeout <= 0) {
      this.timeout = 0;
      this.timer?.destroy();
      this.timer = null;
      this.callback();
    }

    this.updateText();
  }

  destroy(fromScene?: boolean): void {
    this.timer?.destroy();
    super.destroy(fromScene);
  }
}