import { SceneKeys } from "../../..";
import { createGame } from "../../../../api/game";
import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { LevelId } from "../../../../levels";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiButtonText } from "../../../../ui/ButtonText";
import { UiContainer } from "../../../../ui/Container";
import { UiInput } from "../../../../ui/Input";
import { UiSpinner } from "../../../../ui/Spinner";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { EnterGameText, MultiplayerCodeText, MultiplayerInstructionsText, MultiplayerText } from "./translates";

export class MultipleerCreateView implements MenuSceneTypes.View {
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

    const spinner = new UiSpinner(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2);
    this.container.add(spinner);

    this.scene.time.delayedCall(5000, async () => {
      const { code } = await createGame();
      spinner.destroy();
      this.renderView(code);
    });
  }

  renderView(code: string): void {
    const title = this.scene.add.text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 - 150, MultiplayerCodeText.translate.toUpperCase() + ':', { fontSize: 30, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' }).setOrigin(0.5);
    this.container.add(title);

    const input = new UiInput(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 - 50, {
      value: code,
      readonly: true,
      copy: true,
    });
    this.container.add(input);
    const instructions = this.scene.add.text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 70, MultiplayerInstructionsText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    this.container.add(instructions);

    const createGameButton = new UiButtonText(this.scene, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 200, EnterGameText.translate).onClick(() => {
      this.scene.scene.start(SceneKeys.GAMEPLAY, {
        levelId: LevelId.FOREST,
        gameId: code
      });
    });

    this.container.add(createGameButton);

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