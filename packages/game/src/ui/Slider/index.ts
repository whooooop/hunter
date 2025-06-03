import { hexToNumber } from "../../utils/colors";

interface UiSliderOptions {
  width: number;
  height: number;
  min: number;
  max: number;
  gap: number;
  onChange: (value: number) => void;
}

const defaultOptions: UiSliderOptions = {
  width: 300,
  height: 40,
  min: 0,
  max: 1,
  gap: 0.05,
  onChange: (value: number): void => { },
};

export class UiSlider extends Phaser.GameObjects.Container {
  private options: UiSliderOptions;

  constructor(scene: Phaser.Scene, x: number, y: number, options: Partial<UiSliderOptions> = defaultOptions) {
    super(scene, x, y);

    this.options = { ...defaultOptions, ...options };

    const rexUI = (scene as any).rexUI;
    const range = this.options.max - this.options.min

    const print0 = scene.add.text(0, 0, '');
    rexUI.add.slider({
      x: x,
      y: y,
      width: this.options.width,
      height: this.options.height,
      orientation: 'x',

      track: rexUI.add.roundRectangle(0, 0, 0, 0, 15, 0xffffff),
      thumb: rexUI.add.roundRectangle(0, 0, 0, 0, 15, hexToNumber('#343e47')),

      valuechangeCallback: this.options.onChange,
      gap: this.options.gap / range,

      space: {
        top: 4,
        bottom: 4
      },
      input: 'drag', // 'drag'|'click'
    })
      .layout();
  }
}
