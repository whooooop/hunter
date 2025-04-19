import { SceneKeys } from '../index';
import { playButtonTexture, shopButtonTexture, multiplayerButtonTexture, settingsButtonTexture } from './textures';
import { settings } from '../../settings';
import { SceneBackground } from '../../ui/SceneBackground';

interface MenuButton {
  text: string;
  texture: { key: string, url: string, scale: number };
  position: { x: number, y: number };
  leaveOffset: { x: number, y: number };
  textOffset: [number, number]; 
  sceneKey: SceneKeys;
  delay: number;
}

export class MainMenuScene extends Phaser.Scene {
  private ready: boolean = false;
  private sceneBackground!: SceneBackground;
  private playButton!: Phaser.GameObjects.Container;
  private shopButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private multiplayerButton!: Phaser.GameObjects.Container;
  private buttons: Map<SceneKeys, MenuButton> = new Map([
    [SceneKeys.SHOP, {
      text: 'SHOP',
      texture: shopButtonTexture,
      position: {
        x: settings.display.width / 2 + 200,
        y: settings.display.height / 2 + 180,
      },
      leaveOffset: {
        x: -250,
        y: settings.display.height * -1,
      },
      delay: 200,
      textOffset: [-20, 28],
      sceneKey: SceneKeys.SHOP
    }],
    [SceneKeys.SETTINGS, {
      text: 'SETTINGS',
      texture: settingsButtonTexture,
      position: {
        x: settings.display.width / 2 - 200,
        y: settings.display.height / 2 + 200,
      },
      leaveOffset: {
        x: -400,
        y: settings.display.height * -1,
      },
      delay: 400,
      textOffset: [-90, 8],
      sceneKey: SceneKeys.SETTINGS
    }],
    [SceneKeys.MULTIPLAYER, {
      text: 'MULTIPLAYER',
      texture: multiplayerButtonTexture,
      position: {
        x: settings.display.width / 2 - 20,
        y: settings.display.height / 2 + 220,
      },
      leaveOffset: {
        x: 150,
        y: settings.display.height * -1,
      },
      delay: 600,
      textOffset: [-100, 23],
      sceneKey: SceneKeys.MULTIPLAYER
    }]
  ]);

  private buttonContainer: Map<SceneKeys, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: SceneKeys.MAIN_MENU });
  }
  
  preload() {
    SceneBackground.preload(this);
    this.load.image(playButtonTexture.key, playButtonTexture.url);
    this.load.image(shopButtonTexture.key, shopButtonTexture.url);
    this.load.image(settingsButtonTexture.key, settingsButtonTexture.url);
    this.load.image(multiplayerButtonTexture.key, multiplayerButtonTexture.url);
  }

  create() {
    this.sceneBackground = new SceneBackground(this);
    this.createPlayButton();

    this.buttons.forEach(button => {
      this.createMenuButton(button);
    });
    this.enterScene();
  }

  createPlayButton(): void {
    const playButtonContainer = this.add.container(settings.display.width / 2, settings.display.height / 2 - 80).setDepth(50);
    const button = this.add.image(0, 0, playButtonTexture.key).setScale(playButtonTexture.scale);
    const text = this.add.text(-30, 65, 'PLAY', { fontSize: '36px', color: '#ffffff' });
    playButtonContainer.setAlpha(0).setScale(0.8);
    playButtonContainer.add(button);
    playButtonContainer.add(text);
    button.setInteractive();
    button.on('pointerdown', () => this.play());
    button.on('pointerover', () => {
      this.tweens.add({
        targets: playButtonContainer,
        scale: 1.1,
        rotation: 0.06,
        duration: 200,
        ease: 'Power2'
      });
    });
    button.on('pointerout', () => {
      this.tweens.add({
        targets: playButtonContainer,
        scale: 1,
        rotation: 0,
        duration: 200,
        ease: 'Power2'
      });
    });
    this.playButton = playButtonContainer;
  }

  createMenuButton(data: MenuButton): void {
    const container = this.add.container(data.position.x + data.leaveOffset.x, data.position.y + data.leaveOffset.y).setDepth(50);
    const button = this.add.image(0, 0, data.texture.key).setScale(data.texture.scale);
    const textObject = this.add.text(data.textOffset[0], data.textOffset[1], data.text, { fontSize: `30px`, color: '#ffffff' });
    button.setInteractive();
    button.on('pointerdown', () => this.goToScene(data.sceneKey));
    container.add(button);
    container.add(textObject);
    button.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 200,
        ease: 'Power2'
      });
    });
    button.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    this.buttonContainer.set(data.sceneKey, container);
  }

  update(time: number, delta: number): void {
    this.sceneBackground.update(time, delta);
  }

  play(): void {
    this.goToScene(SceneKeys.LOADING);
  }

  goToScene(sceneKey: SceneKeys): void {
    if (!this.ready) {
      return;
    }
    // this.scene.start(sceneKey);
    this.leaveScene().then(() => {
      this.scene.start(sceneKey);
    });
  }

  leaveScene(): Promise<void> {
    return new Promise((resolve) => {
      this.ready = false;
      this.buttons.forEach(button => {
        this.tweens.add({
          targets: this.buttonContainer.get(button.sceneKey),
          x: button.position.x + button.leaveOffset.x,
          y: button.position.y + button.leaveOffset.y,
          duration: 500,
          ease: 'Back.out',
          delay: button.delay,

        });
      });
      this.tweens.add({
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

  enterScene(): void {
    this.buttons.forEach(button => {
      this.tweens.add({
        targets: this.buttonContainer.get(button.sceneKey),
        x: button.position.x,
        y: button.position.y,
        duration: 500,
        ease: 'Back.in',
        delay: button.delay
      });
    });
    this.tweens.add({
      targets: this.playButton,
      scale: 1,
      alpha: 1,
      duration: 250,
      delay: 1300,
      ease: 'Back.in',
      onComplete: () => {
        this.ready = true;
      }
    });
  }

  destroy(): void {
    this.playButton.destroy();
    this.shopButton.destroy();
    this.settingsButton.destroy();
  }
}