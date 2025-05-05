import { emitEvent } from "../../core/Events";
import { BankService } from "../../core/services/BankService";
import { QuestService } from "../../core/services/QuestService";
import { settings } from "../../settings";
import { UiStars, UiReplayButton, UiMenuButton, UiPlayButton } from "../../ui";
import { PauseTask } from "./PauseTask";
import { BlockTexture, BlockTitleTexture } from "./textures";
import { pauseText } from "./translates";
import { LevelId } from "../../levels";
import { Game, Quest, Bank } from "../../core/types";

export class PauseView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bankService: BankService;
  private questService: QuestService;

  private isOpen: boolean = false;

  static preload(scene: Phaser.Scene) {
    UiPlayButton.preload(scene);
    UiReplayButton.preload(scene);
    UiMenuButton.preload(scene);
    UiStars.preload(scene);
    PauseTask.preload(scene);

    scene.load.image(BlockTexture.key, BlockTexture.url);
    scene.load.image(BlockTitleTexture.key, BlockTitleTexture.url);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.bankService = BankService.getInstance();
    this.questService = QuestService.getInstance();
  }

  open({ levelId, questId }: { levelId: LevelId, questId: string }) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();

    this.bankService.getPlayerBalance(Bank.Currency.Star).then((balance) => {
      this.renderStars(balance);
    });

    if (levelId && questId) {
      this.questService.getQuestWithTasksState(levelId, questId).then((result) => {
        if (result) {
          this.renderQuest(result.quest, result.tasks);
        }
      });
    }

    this.container.setScale(0).setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 100,
    });
  }

  close() {
    this.scene.tweens.add({
      targets: this.container,
      scale: 0.4,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.container.destroy();
        this.isOpen = false;
      }
    });
  }

  render() {
    this.container = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2)
      .setScale(0.5)
      .setAlpha(0)
      .setDepth(9000);
    
    const block = this.scene.add.image(0, 0, BlockTexture.key).setScale(BlockTexture.scale);
    const blockTitle = this.scene.add.image(-200, -240, BlockTitleTexture.key).setScale(BlockTitleTexture.scale);
    const text = this.scene.add.text(-200, -240, pauseText.translate.toUpperCase(), { fontSize: 40, color: '#fff', fontFamily: settings.fontFamily.bold }).setOrigin(0.5).setRotation(-0.05);

    const playButton = new UiPlayButton(this.scene, -250, -100);
    const replayButton = new UiReplayButton(this.scene, -250, 30);
    const menuButton = new UiMenuButton(this.scene, -250, 160);

    playButton.on('pointerdown', () => {
      emitEvent(this.scene, Game.Events.Pause.Local, {});
      this.close();
    });

    replayButton.on('pointerdown', () => {
      emitEvent(this.scene, Game.Events.Replay.Local, {});
      this.close();
    });

    menuButton.on('pointerdown', () => {
      emitEvent(this.scene, Game.Events.Exit.Local, {});
      this.close();
    });

    this.container.add(block);
    this.container.add(blockTitle);
    this.container.add(text);
    this.container.add(playButton);
    this.container.add(replayButton);
    this.container.add(menuButton);
  }

  renderStars(balance: number = 0) {
    const uiStars = new UiStars(this.scene, 180, -220, balance);
    this.container.add(uiStars);
  }

  renderQuest(quest: Quest.Config | null, tasks: Record<string, Quest.TaskState>) {
    if (!quest) return;
    const positionY = -100;
    quest.tasks.forEach((task: Quest.BaseTaskConfig, index: number) => {
      const taskBlock = new PauseTask(this.scene, 70, positionY + index * 120, task.title.translate.toUpperCase(), index + 1, tasks[task.id].done, task.reward.amount);
      this.container.add(taskBlock);
    });
  }
}