import { FONT_FAMILY } from "../../config";
import { preloadImage } from "../../preload";
import inputBackgroundUrl from './assets/input_background.png';

const inputBackgroundTexture = {
  url: inputBackgroundUrl,
  key: 'input_background',
  scale: 1,
}

export class UiInput extends Phaser.GameObjects.Container {

  private background: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, inputBackgroundTexture);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, value?: string, readonly?: boolean) {
    super(scene, x, y);

    this.background = scene.add.image(0, 0, inputBackgroundTexture.key)
      .setScale(inputBackgroundTexture.scale)
      .setInteractive();
    this.add(this.background);

    this.text = scene.add.text(0, 0, value || '', {
      fontSize: '24px',
      color: '#fff',
      fontFamily: FONT_FAMILY.REGULAR,
      fixedWidth: this.background.width / 1.4 * this.background.scaleX,
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.text);

    if (!readonly) {
      this.text.setInteractive().on('pointerdown', () => {
        // @ts-ignore
        this.scene.rexUI.edit(this.text, {
          inputStyle: {
            color: '#fff',
            textAlign: 'center',
            fontFamily: FONT_FAMILY.REGULAR,
            fontSize: '24px',
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