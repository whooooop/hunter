import { SceneKeys } from '../index';
import { BackgroundView } from '../../views/background/BackgroundView';
import { SelectMapText } from './translates';
import { settings } from '../../settings';
import { LevelCollection, LevelId } from '../../levels';
import { Level } from '../../core/types/levelTypes';

import plashkaTextureUrl from './assets/plashka1.png';
import plashkaMaskTextureUrl from './assets/mask1.png';
import plashkaPodstavkaTextureUrl from './assets/podstavka.png';
import backButtonTextureUrl from '../../assets/images/back.png';

const backButtonTexture = {
  key: 'SelectMapScene_back_button',
  url: backButtonTextureUrl,
  scale: 0.5,
}

const plashka1Texture = {
  key: 'SelectMapScene_plashka',
  url: plashkaTextureUrl,
  scale: 0.5,
}

const plashka1MaskTexture = {
  key: 'SelectMapScene_plashka_mask',
  url: plashkaMaskTextureUrl,
  scale: 0.5,
}

const plashkaPodstavkaTexture = {
  key: 'SelectMapScene_plashka_podstavka',
  url: plashkaPodstavkaTextureUrl,
  scale: 0.5,
}

export class SelectMapScene extends Phaser.Scene {
  private backgroundView!: BackgroundView;
  private container!: Phaser.GameObjects.Container;
  private levelCollection: Record<LevelId, Level.Config> = LevelCollection;

  constructor() {
    super({ key: 'SELECT_MAP' });
  }
  
  preload() {
    BackgroundView.preload(this);

    this.load.image(plashka1Texture.key, plashka1Texture.url);
    this.load.image(plashka1MaskTexture.key, plashka1MaskTexture.url);
    this.load.image(plashkaPodstavkaTexture.key, plashkaPodstavkaTexture.url);
    this.load.image(backButtonTexture.key, backButtonTexture.url);

    for (const levelConfig of Object.values(this.levelCollection)) {
      this.load.image(levelConfig.preview.key, levelConfig.preview.url);
    }
  }

  create() {
    const center = { x: settings.display.width / 2, y: settings.display.height / 2 };

    this.container = this.add.container(0, 0).setDepth(10);
    this.backgroundView = new BackgroundView(this, this.container);

    const text = this.add.text(center.x, 65, SelectMapText.translate.toUpperCase(), { 
      fontSize: '36px', 
      color: '#ffffff', 
      stroke: '#000000', 
      strokeThickness: 2 
    }).setOrigin(0.5).setDepth(1000);

    this.container.add(text);

    this.renderBlocks();
    this.renderBackButton();
  }

  private renderBackButton(): void {
    const position = { x: 80, y: settings.display.height - 80 };
    const backButton = this.add.image(position.x, position.y, backButtonTexture.key).setOrigin(0.5).setScale(backButtonTexture.scale);
    backButton.setInteractive();
    backButton.on('pointerdown', () => this.back());
    this.container.add(backButton);
  }

  private renderBlocks(): void {
    const center = { x: settings.display.width / 2, y: settings.display.height / 2 };
    const blocks = [
      {
        offsetX: 350,
        offsetY: -60,
        previewOffsetX: 3,
        plashkaTexture: plashka1Texture,
        maskTexture: plashka1MaskTexture,
        flipX: false,
      },
      {
        offsetX: 0,
        offsetY: 0,
        previewOffsetX: 0,
        plashkaTexture: plashka1Texture,
        maskTexture: plashka1MaskTexture,
        flipX: false,
      },
      {
        offsetX: 0,
        offsetY: 0,
        previewOffsetX: 0,
        plashkaTexture: plashka1Texture,
        maskTexture: plashka1MaskTexture,
        flipX: false,
      },
    ];

    Object.keys(this.levelCollection).forEach((levelId, index: number) => {
      const levelConfig = this.levelCollection[levelId as LevelId];
      const blockConfig = blocks[index];
      const offsetX = blockConfig.offsetX;
      const previewOffsetY = blockConfig.offsetY;
      const previewOffsetX = blockConfig.previewOffsetX;

      const text = this.add.text(0, -60, levelConfig.name.translate.toUpperCase(), { 
        fontSize: '32px', 
        color: '#ffffff', 
        stroke: '#000000', 
        strokeThickness: 2 
      }).setOrigin(0.5);
      const container = this.add.container(center.x, center.y);
      const maskImage = this.add.image(center.x - offsetX + previewOffsetX, center.y + previewOffsetY, blocks[index].maskTexture.key).setOrigin(0.5).setScale(blocks[index].maskTexture.scale).setFlipX(blockConfig.flipX as boolean).setVisible(false);
      const preview = this.add.image(previewOffsetX, previewOffsetY, levelConfig.preview.key)
        .setOrigin(0.5)
        .setScale(levelConfig.preview.scale)
        .setTint(0xbbbbbb);
      const mask = maskImage.createBitmapMask();
      preview.setMask(mask);
      
      const plashka = this.add.image(0, 0, blocks[index].plashkaTexture.key).setOrigin(0.5).setScale(blocks[index].plashkaTexture.scale).setFlipX(blockConfig.flipX as boolean);
      const plashkaPodstavka = this.add.image(0, 180, plashkaPodstavkaTexture.key).setOrigin(0.5).setScale(plashkaPodstavkaTexture.scale);

      container.add(plashkaPodstavka);
      container.add(plashka);
      container.add(maskImage);
      container.add(preview);
      container.add(text);
      container.setPosition(center.x - offsetX, center.y);
      plashka.setInteractive();
      plashka.on('pointerdown', () => {
        console.log(levelId);
      });
      this.container.add(container);
    });
  }

  update(time: number, delta: number): void {
    this.backgroundView.update(time, delta);
  }

  back(): void {
    this.scene.start(SceneKeys.MENU);
  }
}