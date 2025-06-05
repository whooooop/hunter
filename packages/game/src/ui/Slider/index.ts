import { Slider } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
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
  gap: 0.01,
  onChange: (value: number): void => { },
};

export class UiSlider {
  private options: UiSliderOptions;
  public element: Slider;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, options: Partial<UiSliderOptions> = defaultOptions) {
    this.options = { ...defaultOptions, ...options };

    const rexUI = (scene as any).rexUI;
    const range = this.options.max - this.options.min

    this.element = new Slider(scene, {
      x,
      y,
      width: this.options.width,
      height: this.options.height,
      orientation: 0,

      background: {
        width: this.options.width,
        height: this.options.height,
        radius: this.options.height / 2,
        color: hexToNumber('#343e47'),
        alpha: 1,
        strokeColor: hexToNumber('#1c2d30'),
        strokeWidth: 4,
      },
      indicator: {
        color: hexToNumber('#ebb639'),
        height: this.options.height - 8,
        radius: this.options.height / 2,
      },
      thumb: {
        radius: this.options.height / 2,
        color: hexToNumber('#19282b'),
        alpha: 1
      },

      valuechangeCallback: this.options.onChange,
      gap: this.options.gap / range,
      enable: true,
      space: {
        top: 2,
        bottom: 2,
        left: 0,
        right: 0,
      },
      input: 'drag',
      // draggable: true,
    }).layout();
  }
}
