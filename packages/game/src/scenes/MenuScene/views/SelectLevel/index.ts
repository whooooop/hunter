import { ClickSound, preloadClickSound } from "../../../../audio/click";
import { DISPLAY, FONT_FAMILY } from "../../../../config";
import { emitEvent } from "../../../../GameEvents";
import { LevelCollection, LevelId } from "../../../../levels";
import { preloadImage, preloadVideo } from "../../../../preload";
import { AudioService } from "../../../../services/AudioService";
import { QuestService } from "../../../../services/QuestService";
import { StatsService } from "../../../../services/StatsService";
import { Level, Quest } from "../../../../types";
import { UiBackButton } from "../../../../ui/BackButton";
import { UiStar } from "../../../../ui/Star";
import { hexToNumber } from "../../../../utils/colors";
import { MenuSceneTypes } from "../../MenuSceneTypes";
import { circleTexture, plashka1MaskTexture, plashka1Texture, plashkaPodstavkaTexture } from "./textures";
import { BestScoreText, GameplaysCountText, SelectLevelText, WavesCountText } from "./translates";

export class SelectLevelView implements MenuSceneTypes.View {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  private backButton: UiBackButton;
  private questService: QuestService;

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
    preloadImage(scene, plashka1Texture);
    preloadImage(scene, plashka1MaskTexture);
    preloadImage(scene, plashkaPodstavkaTexture);
    preloadImage(scene, circleTexture);

    UiStar.preload(scene);

    preloadClickSound(scene);

    for (const levelConfig of Object.values(LevelCollection)) {
      if (levelConfig.preview) {
        preloadImage(scene, levelConfig.preview);
      }
      if (levelConfig.video) {
        preloadVideo(scene, levelConfig.video);
      }
    }
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.backButton = new UiBackButton(this.scene);
    this.questService = QuestService.getInstance();

    this.backButton.on('pointerdown', () => {
      emitEvent(this.scene, MenuSceneTypes.Events.GoToView.Name, { viewKey: MenuSceneTypes.ViewKeys.HOME });
    });

    const title = this.scene.add.text(DISPLAY.WIDTH / 2, 65, SelectLevelText.translate.toUpperCase(), {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: FONT_FAMILY.BOLD
    }).setOrigin(0.5);

    this.renderBlocks();
    this.container.add(title);
    this.container.add(this.backButton);
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

  private renderBlocks(): void {
    const center = { x: DISPLAY.WIDTH / 2, y: DISPLAY.HEIGHT / 2 };

    Object.keys(this.levelCollection).forEach((id: string, index: number) => {
      const levelId = id as LevelId;
      let preview: Phaser.GameObjects.Image | null = null;
      let video: Phaser.GameObjects.Video | null = null;
      const levelConfig = this.levelCollection[levelId as LevelId];
      const blockConfig = this.blocks[index];
      const offsetX = blockConfig.offsetX;
      const previewOffsetY = blockConfig.previewOffsetY + blockConfig.offsetY;
      const previewOffsetX = blockConfig.previewOffsetX;
      const stats = StatsService.getLevelStats(levelId);

      const text = this.scene.add.text(0, -80, levelConfig.name.translate.toUpperCase(), {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        fontFamily: FONT_FAMILY.BOLD
      }).setOrigin(0.5);
      const container = this.scene.add.container(center.x - offsetX, center.y + blockConfig.offsetY);
      const maskImage = this.scene.add.image(center.x - offsetX + previewOffsetX, center.y + previewOffsetY, this.blocks[index].maskTexture.key).setOrigin(0.5).setScale(this.blocks[index].maskTexture.scale).setFlipX(blockConfig.flipX as boolean).setVisible(false);

      // Сначала пытаемся создать видео
      if (levelConfig.video) {
        try {
          video = this.scene.add.video(previewOffsetX, previewOffsetY, levelConfig.video.key)
            .setOrigin(0.5)
            .setScale(levelConfig.video.scale)
            .setLoop(true)
            .setMute(true)
            .setTint(0xbbbbbb);

          const mask = maskImage.createBitmapMask();
          video.setMask(mask);

          // Запускаем видео
          video.play();

          // Добавляем обработчик ошибок для видео
          video.on('error', () => {
            console.warn(`Ошибка воспроизведения видео для уровня ${levelId}`);
            video = null;
            // Если видео не удалось воспроизвести, показываем постер
            if (levelConfig.preview) {
              preview = this.scene.add.image(previewOffsetX, previewOffsetY, levelConfig.preview.key)
                .setOrigin(0.5)
                .setScale(levelConfig.preview.scale)
                .setTint(0xbbbbbb);
              const mask = maskImage.createBitmapMask();
              preview.setMask(mask);
              container.add(preview);
            }
          });
        } catch (error) {
          console.warn(`Ошибка создания видео для уровня ${levelId}:`, error);
          video = null;
        }
      } else if (levelConfig.preview) {
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

      if (video) {
        container.add(video);
      }

      if (preview) {
        container.add(preview);
      }

      if (!levelConfig.disabled) {
        const wavesCount = this.scene.add.text(0, -50, `${WavesCountText.translate}: ${levelConfig.wavesCount}`, {
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          fontFamily: FONT_FAMILY.REGULAR,
        }).setOrigin(0.5);
        container.add(wavesCount);

        const bestScore = this.scene.add.text(0, -10, `${BestScoreText.translate}: ${stats.bestScore}`, {
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          fontFamily: FONT_FAMILY.REGULAR,
        }).setOrigin(0.5);
        container.add(bestScore);

        const gameplaysCount = this.scene.add.text(0, 10, `${GameplaysCountText.translate}: ${stats.gameplays}`, {
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          fontFamily: FONT_FAMILY.REGULAR,
        }).setOrigin(0.5);
        container.add(gameplaysCount);
      }

      container.add(text);
      plashka.setInteractive();
      plashka.on('pointerdown', () => {
        if (levelConfig.disabled) return;
        emitEvent(this.scene, MenuSceneTypes.Events.Play.Name, { levelId });
        AudioService.playAudio(this.scene, ClickSound.key);
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