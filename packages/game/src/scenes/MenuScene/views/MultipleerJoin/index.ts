import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiButtonText } from "../../../../ui/ButtonText";
import { UiContainer } from "../../../../ui/Container";
import { UiInput } from "../../../../ui/Input";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { JoinGameText, MultiplayerCodeText, MultiplayerInstructionsText, MultiplayerText } from "./translates";

export class MultipleerJoinView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;

  static preload(scene: Phaser.Scene): void {
    UiBackButton.preload(scene);
    UiContainer.preload(scene);
    UiButtonText.preload(scene);
    UiInput.preload(scene);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.container.add(this.backButton);

    const container = new UiContainer(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, MultiplayerText.translate);
    this.container.add(container);

    const title = this.scene.add.text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 - 150, MultiplayerCodeText.translate.toUpperCase() + ':', { fontSize: 30, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' }).setOrigin(0.5);
    this.container.add(title);

    const input = new UiInput(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 - 50, {
      value: '',
      readonly: false,
      copy: false,
      onChange: () => { },
    });
    this.container.add(input);

    const instructions = this.scene.add.text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 70, MultiplayerInstructionsText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    this.container.add(instructions);

    const joinGameButton = new UiButtonText(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 200, JoinGameText.translate).on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER_CREATE });
    });

    this.container.add(joinGameButton);

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER });
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