import { SceneKeys } from "../../..";
import { checkGame } from "../../../../api/game";
import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { LevelId } from "../../../../levels";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiButtonText } from "../../../../ui/ButtonText";
import { UiContainer } from "../../../../ui/Container";
import { UiInput } from "../../../../ui/Input";
import { UiSpinner } from "../../../../ui/Spinner";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { EnterCodeErrorText, JoinGameErrorText, JoinGameText, MultiplayerCodeText, MultiplayerInstructionsText, MultiplayerText } from "./translates";

export class MultipleerJoinView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;
  private content: Phaser.GameObjects.Container;
  private errorText: Phaser.GameObjects.Text;

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

    this.content = this.scene.add.container(0, 0);
    container.add(this.content);

    const title = this.scene.add.text(0, -150, MultiplayerCodeText.translate.toUpperCase() + ':', { fontSize: 30, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' }).setOrigin(0.5);
    this.content.add(title);

    const input = new UiInput(this.scene, 0, -50, {
      value: '',
      readonly: false,
      copy: false,
      onChange: () => { },
    });
    this.content.add(input);

    const instructions = this.scene.add.text(0, 60, MultiplayerInstructionsText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    this.content.add(instructions);

    this.errorText = this.scene.add.text(0, 250, '', { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#f5093a', align: 'center' })
      .setOrigin(0.5)
      .setWordWrapWidth(DISPLAY.WIDTH / 3);
    this.content.add(this.errorText);

    const joinGameButton = new UiButtonText(this.scene, 0, 170, JoinGameText.translate).onClick(() => {
      const code = input.getValue();
      if (code.length === 0) {
        this.handleError(EnterCodeErrorText.translate);
        return;
      }

      this.content.visible = false;
      const spinner = new UiSpinner(this.scene, 0, 0);
      container.add(spinner);

      this.scene.time.delayedCall(5000, async () => {
        try {
          const { result } = await checkGame(code);
          spinner.destroy();
          if (!result) {
            this.handleError(JoinGameErrorText.translate);
          } else {
            this.handleError('');
            this.scene.scene.start(SceneKeys.GAMEPLAY, {
              levelId: LevelId.FOREST,
              gameId: code
            });
          }
        } catch (error) {
          this.handleError(JoinGameErrorText.translate);
        } finally {
          spinner.destroy();
        }
      });
    });

    this.content.add(joinGameButton);

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER });
    });
  }

  handleError(text: string): void {
    this.errorText.text = text;
    this.content.visible = true;
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