import { emitEvent } from "../../../../GameEvents";
import { ClickSound, preloadClickSound } from "../../../../audio/click";
import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { preloadImage } from "../../../../preload";
import { AudioService } from "../../../../services/AudioService";
import { getLogoTexture, preloadLogoTextures } from "../../../../textures/logo";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { multiplayerButtonTexture, playButtonTexture, settingsButtonTexture, shopButtonTexture } from "./textures";
import { MultiplayerText, PlayText, SettingsText, ShopText } from "./translates";
import { MenuButton } from "./types";

export class HomeView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;

  private ready: boolean = false;

  private playButton!: Phaser.GameObjects.Container;
  private shopButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private multiplayerButton!: Phaser.GameObjects.Container;
  private buttonContainer: Map<string, Phaser.GameObjects.Container> = new Map();

  private buttons: Set<MenuButton> = new Set([
    {
      key: 'shop',
      text: ShopText.translate,
      texture: shopButtonTexture,
      position: {
        x: DISPLAY.WIDTH / 2 + 200,
        y: DISPLAY.HEIGHT / 2 + 180,
      },
      leaveOffset: {
        x: -250,
        y: DISPLAY.HEIGHT * -1,
      },
      delay: 200,
      textOffset: [10, 40],
      viewKey: MenuSceneTypes.ViewKeys.SHOP
    },
    {
      key: 'settings',
      text: SettingsText.translate,
      texture: settingsButtonTexture,
      position: {
        x: DISPLAY.WIDTH / 2 - 200,
        y: DISPLAY.HEIGHT / 2 + 200,
      },
      leaveOffset: {
        x: -400,
        y: DISPLAY.HEIGHT * -1,
      },
      delay: 400,
      textOffset: [-10, 20],
      viewKey: MenuSceneTypes.ViewKeys.SETTINGS
    },
    {
      key: 'multiplayer',
      text: MultiplayerText.translate,
      texture: multiplayerButtonTexture,
      position: {
        x: DISPLAY.WIDTH / 2 - 20,
        y: DISPLAY.HEIGHT / 2 + 220,
      },
      leaveOffset: {
        x: 150,
        y: DISPLAY.HEIGHT * -1,
      },
      delay: 600,
      textOffset: [0, 40],
      viewKey: MenuSceneTypes.ViewKeys.MULTIPLAYER
    }
  ]);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    const logoTexture = getLogoTexture();
    const logo = this.scene.add.image(DISPLAY.WIDTH / 2, 120, logoTexture.key).setScale(logoTexture.scale);
    this.container.add(logo);

    this.createPlayButton();
    this.buttons.forEach(button => {
      this.createMenuButton(button);
    });
  }

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, playButtonTexture);
    preloadImage(scene, shopButtonTexture);
    preloadImage(scene, settingsButtonTexture);
    preloadImage(scene, multiplayerButtonTexture);
    preloadClickSound(scene);
    preloadLogoTextures(scene);
  }

  public update(time: number, delta: number): void { }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  private createPlayButton(): void {
    const playButtonContainer = this.scene.add.container(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 - 40).setDepth(50);
    const button = this.scene.add.image(0, 0, playButtonTexture.key).setScale(playButtonTexture.scale);
    const text = this.scene.add.text(4, 84, PlayText.translate, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(0.5);
    playButtonContainer.setAlpha(0).setScale(0.8);
    playButtonContainer.add(button);
    playButtonContainer.add(text);
    button.setInteractive();
    button.on('pointerdown', () => {
      this.goToScene(MenuSceneTypes.ViewKeys.SELECT_LEVEL);
      AudioService.playAudio(this.scene, ClickSound.key);
    });
    button.on('pointerover', () => {
      this.scene.tweens.add({
        targets: playButtonContainer,
        scale: 1.1,
        rotation: 0.06,
        duration: 200,
        ease: 'Power2'
      });
    });
    button.on('pointerout', () => {
      this.scene.tweens.add({
        targets: playButtonContainer,
        scale: 1,
        rotation: 0,
        duration: 200,
        ease: 'Power2'
      });
    });
    this.playButton = playButtonContainer;
  }

  private createMenuButton(data: MenuButton): void {
    const container = this.scene.add.container(data.position.x + data.leaveOffset.x, data.position.y + data.leaveOffset.y).setDepth(50);
    const button = this.scene.add.image(0, 0, data.texture.key).setScale(data.texture.scale);
    const textObject = this.scene.add.text(data.textOffset[0], data.textOffset[1], data.text, { fontSize: 22, fontFamily: FONT_FAMILY.REGULAR, color: '#ffffff' }).setOrigin(0.5);
    button.setInteractive();
    button.on('pointerdown', () => {
      this.goToScene(data.viewKey);
      AudioService.playAudio(this.scene, ClickSound.key);
    });
    container.add(button);
    container.add(textObject);
    button.on('pointerover', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 200,
        ease: 'Power2'
      });
    });
    button.on('pointerout', () => {
      this.scene.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    this.buttonContainer.set(data.key, container);
  }

  goToScene(viewKey: MenuSceneTypes.ViewKeys): void {
    if (!this.ready) {
      return;
    }
    emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey });
  }

  enter(): Promise<void> {
    return new Promise((resolve) => {
      this.buttons.forEach(button => {
        this.scene.tweens.add({
          targets: this.buttonContainer.get(button.key),
          x: button.position.x,
          y: button.position.y,
          duration: 500,
          ease: 'Back.in',
          delay: button.delay
        });
      });
      this.scene.tweens.add({
        targets: this.playButton,
        scale: 1,
        alpha: 1,
        duration: 250,
        delay: 1300,
        ease: 'Back.in',
        onComplete: () => {
          this.ready = true;
          resolve();
        }
      });
    });
  }

  leave(): Promise<void> {
    return new Promise((resolve) => {
      this.ready = false;
      this.buttons.forEach(button => {
        this.scene.tweens.add({
          targets: this.buttonContainer.get(button.key),
          x: button.position.x + button.leaveOffset.x,
          y: button.position.y + button.leaveOffset.y,
          duration: 500,
          ease: 'Back.out',
          delay: button.delay,

        });
      });
      this.scene.tweens.add({
        targets: this.playButton,
        scale: 0.8,
        alpha: 0,
        duration: 500,
        delay: 500,
        ease: 'Back.out',
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}