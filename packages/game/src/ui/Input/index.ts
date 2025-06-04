import { FONT_FAMILY } from "../../config";
import { preloadImage } from "../../preload";
import copyUrl from './assets/copy.png';
import inputBackgroundUrl from './assets/input_background.png';
import copySuccessUrl from './assets/input_copy_success.png';

const inputBackgroundTexture = {
  url: inputBackgroundUrl,
  key: 'input_background',
  scale: 1,
}

const copyTexture = {
  url: copyUrl,
  key: 'input_copy',
  scale: 0.6,
}

const copySuccessTexture = {
  url: copySuccessUrl,
  key: 'input_copy_success',
  scale: 0.6,
}

interface UiInputOptions {
  value: string;
  readonly: boolean;
  copy: boolean;
  onChange: (value: string) => void;
  onCopy: (value: string) => void;
}

const defaultOptions: UiInputOptions = {
  value: '',
  readonly: false,
  copy: false,
  onChange: () => { },
  onCopy: () => { },
}

export class UiInput extends Phaser.GameObjects.Container {

  private background: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;
  private copy: Phaser.GameObjects.Image | null = null;
  private options: UiInputOptions;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, inputBackgroundTexture);
    preloadImage(scene, copyTexture);
    preloadImage(scene, copySuccessTexture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, options: Partial<UiInputOptions>) {
    super(scene, x, y);

    this.options = { ...defaultOptions, ...options };

    const fontSize = 40;
    this.background = scene.add.image(0, 0, inputBackgroundTexture.key)
      .setScale(inputBackgroundTexture.scale)
      .setInteractive();
    this.add(this.background);

    this.text = scene.add.text(0, 0, this.options.value, {
      fontSize,
      color: '#fff',
      fontFamily: FONT_FAMILY.REGULAR,
      fixedWidth: this.background.width / 1.4 * this.background.scaleX,
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.text);

    if (this.options.copy) {
      this.copy = scene.add.image(this.background.width / 2 - 60, 0, copyTexture.key)
        .setScale(copyTexture.scale)
        .setInteractive();
      this.copy.on('pointerdown', () => {
        try {
          navigator.clipboard.writeText(this.text.text);
          this.options.onCopy(this.text.text);
          this.copy!.setTexture(copySuccessTexture.key);
          this.scene.time.delayedCall(1000, () => {
            this.copy!.setTexture(copyTexture.key);
          });
        } catch (error) { }
      });
      this.add(this.copy);
    }

    if (!this.options.readonly) {
      this.text.setInteractive().on('pointerdown', () => {
        // @ts-ignore
        this.scene.rexUI.edit(this.text, {
          inputStyle: {
            color: '#fff',
            textAlign: 'center',
            fontFamily: FONT_FAMILY.REGULAR,
            fontSize,
            padding: '0',
            margin: '0',
            boxSizing: 'border-box',
            lineHeight: `${this.background.height * this.background.scaleY}px`,
            height: `${this.background.height * this.background.scaleY}px`,
            width: `${this.background.width * this.background.scaleX}px`,
            background: 'transparent',
            border: 'none',
            outline: 'none',
          },
          onOpen: (textObject: any, inputText: any) => {
            if (inputText && inputText.parent) {
              inputText.parent.style.transformOrigin = '50% 50%';
            }
          }
        });
      });
    }
  }

  public getValue(): string {
    return this.text.text;
  }

  public setValue(val: string) {
    this.text.setText(val);
  }
}