import { DISPLAY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiButtonText } from "../../../../ui/ButtonText";
import { UiContainer } from "../../../../ui/Container";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { JoinGameText, MultiplayerText } from "./translates";

export class MultipleerJoinView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;

  static preload(scene: Phaser.Scene): void {
    UiBackButton.preload(scene);
    UiContainer.preload(scene);
    UiButtonText.preload(scene);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.container.add(this.backButton);

    const container = new UiContainer(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, MultiplayerText.translate);
    this.container.add(container);

    const joinGameButton = new UiButtonText(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 80, JoinGameText.translate).onClick(() => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER_JOIN });
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