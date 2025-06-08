import { SceneKeys } from "../../..";
import { createGame } from "../../../../api/game";
import { DISPLAY, FONT_FAMILY, MULTIPLAYER_EXTRA_DURATION } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { LevelId } from "../../../../levels";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiButtonText } from "../../../../ui/ButtonText";
import { UiContainer } from "../../../../ui/Container";
import { UiInput } from "../../../../ui/Input";
import { UiSpinner } from "../../../../ui/Spinner";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { CreateGameErrorText, EnterGameText, MultiplayerCodeText, MultiplayerInstructionsText, MultiplayerText } from "./translates";

export class MultipleerCreateView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;
  private content!: Phaser.GameObjects.Container;
  private errorText!: Phaser.GameObjects.Text;
  private input!: UiInput;
  private code: string = '';

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
    container.setScale(0.9);
    this.container.add(container);

    const spinner = new UiSpinner(this.scene, 0, 0);
    container.add(spinner);

    this.content = this.scene.add.container(0, 0);
    this.content.visible = false;
    container.add(this.content);

    const title = this.scene.add.text(0, -150, MultiplayerCodeText.translate.toUpperCase() + ':', { fontSize: 30, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' }).setOrigin(0.5);
    this.content.add(title);

    this.input = new UiInput(this.scene, 0, -50, {
      value: '',
      readonly: true,
      copy: true,
    });
    this.content.add(this.input);
    const instructions = this.scene.add.text(0, 70, MultiplayerInstructionsText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    this.content.add(instructions);

    const createGameButton = new UiButtonText(this.scene, 0, 200, EnterGameText.translate).onClick(() => {
      this.scene.scene.start(SceneKeys.GAMEPLAY, {
        levelId: LevelId.FOREST,
        gameId: this.code
      });
    });
    this.content.add(createGameButton);

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER });
    });

    this.errorText = this.scene.add.text(0, 0, '', { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#f5093a', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    container.add(this.errorText);


    this.scene.time.delayedCall(MULTIPLAYER_EXTRA_DURATION, async () => {
      try {
        const { code } = await createGame();
        this.code = code;
        this.input.setValue(code);
        this.content.visible = true;
      } catch (error) {
        this.errorText.text = CreateGameErrorText.translate;
      } finally {
        spinner.destroy();
      }
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