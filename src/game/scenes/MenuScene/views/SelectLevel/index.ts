import { emitEvent } from "../../../../core/Events";
import { LevelCollection, LevelId } from "../../../../levels";
import { plashka1MaskTexture, plashkaPodstavkaTexture, plashka1Texture } from "./textures";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { UiBackButton } from "../../ui/backButton";
import { Level } from "../../../../core/types/levelTypes";
import { settings } from "../../../../settings";
import { SelectLevelText } from "./translates";

export class SelectLevelView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;

  private levelCollection: Record<LevelId, Level.Config> = LevelCollection;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(plashka1Texture.key, plashka1Texture.url);
    scene.load.image(plashka1MaskTexture.key, plashka1MaskTexture.url);
    scene.load.image(plashkaPodstavkaTexture.key, plashkaPodstavkaTexture.url);

    for (const levelConfig of Object.values(LevelCollection)) {
      scene.load.image(levelConfig.preview.key, levelConfig.preview.url);
    }
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.HOME });
    });

    const text = this.scene.add.text(settings.display.width / 2, 65, SelectLevelText.translate.toUpperCase(), { 
      fontSize: '36px', 
      color: '#ffffff', 
      stroke: '#000000', 
      strokeThickness: 2 
    }).setOrigin(0.5);

    this.renderBlocks();
    this.container.add(text);
    this.container.add(this.backButton);
  }

  update(time: number, delta: number): void {}

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

      const text = this.scene.add.text(0, -60, levelConfig.name.translate.toUpperCase(), { 
        fontSize: '32px', 
        color: '#ffffff', 
        stroke: '#000000', 
        strokeThickness: 2 
      }).setOrigin(0.5);
      const container = this.scene.add.container(center.x, center.y);
      const maskImage = this.scene.add.image(center.x - offsetX + previewOffsetX, center.y + previewOffsetY, blocks[index].maskTexture.key).setOrigin(0.5).setScale(blocks[index].maskTexture.scale).setFlipX(blockConfig.flipX as boolean).setVisible(false);
      const preview = this.scene.add.image(previewOffsetX, previewOffsetY, levelConfig.preview.key)
        .setOrigin(0.5)
        .setScale(levelConfig.preview.scale)
        .setTint(0xbbbbbb);
      const mask = maskImage.createBitmapMask();
      preview.setMask(mask);
      
      const plashka = this.scene.add.image(0, 0, blocks[index].plashkaTexture.key).setOrigin(0.5).setScale(blocks[index].plashkaTexture.scale).setFlipX(blockConfig.flipX as boolean);
      const plashkaPodstavka = this.scene.add.image(0, 180, plashkaPodstavkaTexture.key).setOrigin(0.5).setScale(plashkaPodstavkaTexture.scale);

      container.add(plashkaPodstavka);
      container.add(plashka);
      container.add(maskImage);
      container.add(preview);
      container.add(text);
      container.setPosition(center.x - offsetX, center.y);
      plashka.setInteractive();
      plashka.on('pointerdown', () => {
        emitEvent(this.scene, MenuSceneTypes.Events.Play.Name, { levelId });
      });
      this.container.add(container);
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}