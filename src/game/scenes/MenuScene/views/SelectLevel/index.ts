import { emitEvent } from "../../../../core/Events";
import { LevelCollection, LevelId } from "../../../../levels";
import { plashka1MaskTexture, plashkaPodstavkaTexture, plashka1Texture, circleTexture } from "./textures";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { UiBackButton } from "../../../../ui/BackButton";
import { Level, Quest, Bank } from "../../../../core/types";
import { SelectLevelText } from "./translates";
import { QuestService } from "../../../../core/services/QuestService";
import { UiStar } from "../../../../ui/Star";
import { hexToNumber } from "../../../../utils/colors";
import { BankService } from "../../../../core/services/BankService";
import { UiStars } from "../../../../ui/Stars";
import { DISPLAY, FONT_FAMILY } from "../../../../config";

export class SelectLevelView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;
  private questService: QuestService;
  private bankService: BankService;

  private levelCollection: Record<LevelId, Level.Config> = LevelCollection;

  private blocks = [
    {
      offsetX: 390,
      offsetY: -10,
      previewOffsetY: -80,
      previewOffsetX: 3,
      plashkaTexture: plashka1Texture,
      maskTexture: plashka1MaskTexture,
      flipX: false,
    },
    {
      offsetX: 0,
      offsetY: 20,
      previewOffsetY: 0,
      previewOffsetX: 0,
      plashkaTexture: plashka1Texture,
      maskTexture: plashka1MaskTexture,
      flipX: true,
    },
    {
      offsetX: -390,
      offsetY: 0,
      previewOffsetY: 0,
      previewOffsetX: 0,
      plashkaTexture: plashka1Texture,
      maskTexture: plashka1MaskTexture,
      flipX: false,
    },
  ];

  static preload(scene: Phaser.Scene): void {
    scene.load.image(plashka1Texture.key, plashka1Texture.url);
    scene.load.image(plashka1MaskTexture.key, plashka1MaskTexture.url);
    scene.load.image(plashkaPodstavkaTexture.key, plashkaPodstavkaTexture.url);
    scene.load.image(circleTexture.key, circleTexture.url);

    UiStar.preload(scene);
    UiStars.preload(scene);
    
    for (const levelConfig of Object.values(LevelCollection)) {
      if (levelConfig.preview) {
        scene.load.image(levelConfig.preview.key, levelConfig.preview.url);
      }
    }
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.questService = QuestService.getInstance();
    this.bankService = BankService.getInstance();

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.HOME });
    });

    const title = this.scene.add.text(DISPLAY.WIDTH / 2, 65, SelectLevelText.translate.toUpperCase(), { 
      fontSize: '36px', 
      color: '#ffffff', 
      stroke: '#000000', 
      strokeThickness: 4,
      fontFamily: FONT_FAMILY.BOLD
    }).setOrigin(0.5);

    this.bankService.getPlayerBalance(Bank.Currency.Star).then((balance: number) => {
      const uiStars = new UiStars(this.scene, 1100, 66, balance);
      this.container.add(uiStars);
    });

    this.renderBlocks();
    this.container.add(title);
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
    const center = { x: DISPLAY.WIDTH / 2, y: DISPLAY.HEIGHT / 2 };

    Object.keys(this.levelCollection).forEach((id: string, index: number) => {
      const levelId = id as LevelId;
      let preview: Phaser.GameObjects.Image | null = null;
      const levelConfig = this.levelCollection[levelId as LevelId];
      const blockConfig = this.blocks[index];
      const offsetX = blockConfig.offsetX;
      const previewOffsetY = blockConfig.previewOffsetY + blockConfig.offsetY;
      const previewOffsetX = blockConfig.previewOffsetX;

      const text = this.scene.add.text(0, -80, levelConfig.name.translate.toUpperCase(), { 
        fontSize: '32px', 
        color: '#ffffff', 
        stroke: '#000000', 
        strokeThickness: 3,
        fontFamily: FONT_FAMILY.BOLD
      }).setOrigin(0.5);
      const container = this.scene.add.container(center.x - offsetX, center.y + blockConfig.offsetY);
      const maskImage = this.scene.add.image(center.x - offsetX + previewOffsetX, center.y + previewOffsetY, this.blocks[index].maskTexture.key).setOrigin(0.5).setScale(this.blocks[index].maskTexture.scale).setFlipX(blockConfig.flipX as boolean).setVisible(false);
      if (levelConfig.preview) {
        preview = this.scene.add.image(previewOffsetX, previewOffsetY, levelConfig.preview.key)
          .setOrigin(0.5)
          .setScale(levelConfig.preview.scale)
          .setTint(0xbbbbbb);
          const mask = maskImage.createBitmapMask();
          preview.setMask(mask);
      }

      const plashka = this.scene.add.image(0, 0, this.blocks[index].plashkaTexture.key).setOrigin(0.5).setScale(this.blocks[index].plashkaTexture.scale).setFlipX(blockConfig.flipX as boolean);
      const plashkaPodstavka = this.scene.add.image(0, 180, plashkaPodstavkaTexture.key).setOrigin(0.5).setScale(plashkaPodstavkaTexture.scale);
      const tasksContainer = this.scene.add.container(0, 80);

      container.add(plashkaPodstavka);
      container.add(plashka);
      container.add(maskImage);
      container.add(tasksContainer);

      if (preview) {
        container.add(preview);
      }
      container.add(text);
      plashka.setInteractive();
      plashka.on('pointerdown', () => {
        if (levelConfig.disabled) return;
        emitEvent(this.scene, MenuSceneTypes.Events.Play.Name, { levelId });
      });

      this.questService.getCurrentQuest(levelId).then((quest: Quest.Config | null) => {
        if (!quest) return;
        
        quest.tasks.forEach((task: Quest.AnyTaskConfig, index: number) => {
          const leftOffset = -130;
          const containerHeight = 50;
          const deviderColor = hexToNumber('#3b575a');
          const taskContainer = this.scene.add.container(0, containerHeight * index);
          const circle = this.scene.add.image(leftOffset, 0, circleTexture.key).setOrigin(0.5).setScale(circleTexture.scale);
          const uiStar = new UiStar(this.scene, 126, 4, task.reward.amount).setScale(0.6);
          
          const title = this.scene.add.text(leftOffset + 26, 0, task.title.translate.toUpperCase(), { 
            fontSize: '14px', 
            color: '#ffffff', 
            stroke: '#000000', 
            strokeThickness: 2,
            fontFamily: FONT_FAMILY.REGULAR,
          }).setOrigin(0, 0.5).setWordWrapWidth(200);
          const number = this.scene.add.text(leftOffset, 0, `${index + 1}`, { 
            fontSize: '16px', 
            color: '#ffffff', 
            stroke: '#000000', 
            strokeThickness: 2,
            fontFamily: FONT_FAMILY.REGULAR,
          }).setOrigin(0.5);

          if (index !== quest.tasks.length - 1) {
            const devider = this.scene.add.rectangle(0, containerHeight / 2, 290, 2, deviderColor, 1).setOrigin(0.5);
            taskContainer.add(devider);
          }

          taskContainer.add(circle);
          taskContainer.add(title);
          taskContainer.add(uiStar);
          taskContainer.add(number);
          tasksContainer.add(taskContainer);
        });
      });

      this.container.add(container);
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}