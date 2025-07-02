import { DISPLAY, FONT_FAMILY } from '../../config';
import { preloadImage } from '../../preload';
import { UiButtonTimer } from '../ButtonTimer';
import tutorialMessageBackground from './assets/intersect.png';

const texture = {
  key: 'tutorial_message_background',
  url: tutorialMessageBackground,
  scale: 0.46,
}

export interface UiTutorialMessageProps {
  text: string;
  buttonText?: string;
  callback?: () => void;
}

export class UiTutorialMessage extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Image;
  private button: UiButtonTimer | null = null;
  private timer: Phaser.Time.TimerEvent | null = null;

  private visibleY: number = DISPLAY.HEIGHT - 97;
  private hiddenY: number = DISPLAY.HEIGHT + 100;

  static preload(scene: Phaser.Scene): void {
    UiButtonTimer.preload(scene);
    preloadImage(scene, { key: texture.key, url: texture.url! });
  }

  constructor(scene: Phaser.Scene, props: UiTutorialMessageProps) {
    super(scene, DISPLAY.WIDTH / 2, 0);

    const textWidth = props.buttonText && props.callback ? 640 : 820;
    this.text = this.scene.add.text(-400, 20, props.text, { fontSize: 22, color: '#ffffff', align: 'left', fontFamily: FONT_FAMILY.REGULAR }).setOrigin(0, 0.5).setWordWrapWidth(textWidth);
    this.background = this.scene.add.image(0, 0, texture.key).setScale(texture.scale);

    this.setY(this.hiddenY);
    this.add(this.background);
    this.add(this.text);

    if (props.buttonText && props.callback) {
      this.button = new UiButtonTimer(this.scene, 400, 20, props.buttonText, 0, props.callback);
      this.add(this.button);
    }
  }

  show(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        duration: 600,
        y: this.visibleY,
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
        y: this.hiddenY,
        ease: 'Quint.easeInOut',
        onComplete: () => resolve()
      });
    });
  }
}