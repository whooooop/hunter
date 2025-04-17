import { SceneKeys } from '../index';
import { groundTexture, skyTexture, mountainTexture_1, mountainTexture_2, mountainTexture_3, playButtonTexture, shopButtonTexture, multiplayerButtonTexture, settingsButtonTexture } from './textures';
import { settings } from '../../settings';
import { Clouds } from '../../ui/Clouds';
import { CLOUDS } from './config';

export class MainMenuScene extends Phaser.Scene {
  private clouds!: Clouds;

  constructor() {
    super({ key: SceneKeys.MAIN_MENU });
  }
  
  preload() {
    this.load.image(skyTexture.key, skyTexture.url);
    this.load.image(groundTexture.key, groundTexture.url);
    this.load.image(mountainTexture_1.key, mountainTexture_1.url);
    this.load.image(mountainTexture_2.key, mountainTexture_2.url);
    this.load.image(mountainTexture_3.key, mountainTexture_3.url);  
    this.load.image(playButtonTexture.key, playButtonTexture.url);
    this.load.image(shopButtonTexture.key, shopButtonTexture.url);
    this.load.image(settingsButtonTexture.key, settingsButtonTexture.url);
    this.load.image(multiplayerButtonTexture.key, multiplayerButtonTexture.url);
    Clouds.preload(this);
  }

  create() {
    // this.add.rectangle(0, 0, settings.display.width, settings.display.height, backgroundColor, 1).setOrigin(0, 0);
    this.add.image(0, 0, skyTexture.key, settings.display.width).setOrigin(0, 0).setScale(1.2);
    this.add.image(0, 0, mountainTexture_3.key, settings.display.width).setOrigin(0, 0);
    this.add.image(0, 300, mountainTexture_2.key, settings.display.width).setOrigin(0, 0);
    this.add.image(0, 200, mountainTexture_1.key, settings.display.width).setOrigin(0, 0);
    this.add.image(0, -28, groundTexture.key, settings.display.width).setOrigin(0, 0);

    this.clouds = new Clouds(this, CLOUDS);

    this.createPlayButton();
    this.createMenuButton(shopButtonTexture, settings.display.width / 2 + 200, settings.display.height / 2 + 180, '30px', 'SHOP', [-20, 28], SceneKeys.SHOP);
    this.createMenuButton(settingsButtonTexture, settings.display.width / 2 - 200, settings.display.height / 2 + 200, '30px', 'SETTINGS', [-90, 8], SceneKeys.SETTINGS);
    this.createMenuButton(multiplayerButtonTexture, settings.display.width / 2 - 20, settings.display.height / 2 + 220, '30px', 'MULTIPLAYER', [-100, 23], SceneKeys.MULTIPLAYER);
  }

  createPlayButton(): void {
    const playButtonContainer = this.add.container(settings.display.width / 2, settings.display.height / 2 - 80);
    const button = this.add.image(0, 0, playButtonTexture.key).setScale(playButtonTexture.scale);
    const text = this.add.text(-30, 65, 'PLAY', { fontSize: '36px', color: '#ffffff' });
   
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
  }

  createMenuButton(texture: { scale: number, key: string }, x: number, y: number, fontSize: string, text: string, textOffset: [number, number], sceneKey: SceneKeys): void {
    const container = this.add.container(x, y);
    const button = this.add.image(0, 0, texture.key).setScale(texture.scale);
    const textObject = this.add.text(textOffset[0], textOffset[1], text, { fontSize, color: '#ffffff' });
    button.setInteractive();
    button.on('pointerdown', () => this.goToScene(sceneKey));
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
  }

  update(time: number, delta: number): void {
    this.clouds.update(time, delta);
  }

  play(): void {
    console.log('play');
    this.scene.start(SceneKeys.GAMEPLAY);
  }

  goToScene(sceneKey: SceneKeys): void {
    console.log('goToScene', sceneKey);
    // this.scene.start(sceneKey);
  } 
}