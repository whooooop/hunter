import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiContainer } from "../../../../ui/Container";
import { UiSlider } from "../../../../ui/Slider";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { SettingsText, SoonText } from "./translates";

export class SettingsView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;

  static preload(scene: Phaser.Scene): void {
    UiContainer.preload(scene);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.container.add(this.backButton);

    const container = new UiContainer(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, SettingsText.translate);
    this.container.add(container);

    const slider = new UiSlider(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, {
      onChange: (value: number) => {
        console.log(value);
      }
    });
    this.container.add(slider);
    // audioWeaponVolume: 0.5,
    // audioEffectsVolume: 1,
    // audioMusicVolume: 0.5,

    const text = this.scene.add.text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, SoonText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(0.5);
    this.container.add(text);

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.HOME });
    });
  }

  update(time: number, delta: number): void { }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  enter(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  leave(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}