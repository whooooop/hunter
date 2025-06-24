import { DISPLAY } from "../../../../config";
import { UiTimerButton } from "../../../../ui";
import { ControlsViewBase } from "./base";
import { DesktopControlsView } from "./desktop";
import { MobileControlsView } from "./mobile";
import { iUnderstandText } from "./translates";

export class ControlsView extends ControlsViewBase {
  private readonly helpContainer!: ControlsViewBase;

  private timerButton: UiTimerButton;

  private resolver: (value: void | PromiseLike<void>) => void = () => { };

  private readonly depthValue: number = 1000;
  private readonly buttonY: number = DISPLAY.HEIGHT - 80;
  private readonly buttonYHide: number = DISPLAY.HEIGHT + 80;

  static preload(scene: Phaser.Scene): void {
    UiTimerButton.preload(scene);
  }

  constructor(
    scene: Phaser.Scene
  ) {
    super(scene, 0, 0);

    this.setDepth(this.depthValue);

    this.timerButton = new UiTimerButton(this.scene, DISPLAY.WIDTH / 2, this.buttonYHide, iUnderstandText.translate, 0, () => {
      this.hide();
    });

    if (this.scene.sys.game.device.os.desktop) {
      this.helpContainer = new DesktopControlsView(this.scene);
    } else {
      this.helpContainer = new MobileControlsView(this.scene);
    }

    this.add(this.helpContainer);
    this.add(this.timerButton);
  }

  public wait(timeout: number): Promise<void> {
    this.timerButton.setTimer(timeout);
    return this.show();
  }

  async show(): Promise<void> {
    await this.helpContainer.show();
    return new Promise((resolve) => {
      this.resolver = resolve;
      this.scene.tweens.add({
        targets: this.timerButton,
        y: this.buttonY,
        duration: 600,
        ease: 'Quint.easeInOut'
      });
    });
  }

  hide(): Promise<void> {
    return new Promise((resolve) => {
      this.helpContainer.hide();
      this.scene.tweens.add({
        targets: this.timerButton,
        y: this.buttonYHide,
        duration: 600,
        ease: 'Quint.easeInOut',
        onComplete: async () => {
          resolve();
          this.resolver();
        }
      });
    });
  }
}