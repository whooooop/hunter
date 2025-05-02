import { emitEvent, onEvent } from "../../core/Events";
import { Game } from "../../core/types/gameTypes";
import { settings } from "../../settings";
import { UiMenuButton } from "../../ui/MenuButton";
import { UiPlayButton } from "../../ui/PlayButton";
import { UiReplayButton } from "../../ui/ReplayButton";
import { UiStars } from "../../ui/Stars";
import { PauseTask } from "./PauseTask";
import { BlockTexture, BlockTitleTexture } from "./textures";
import { pauseText } from "./translates";

export class PauseView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

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

    onEvent(this.scene, Game.Events.Pause.Local, this.open, this);
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;

    this.render();
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
    const starsCount = 4;

    this.container = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2)
      .setScale(0.5)
      .setAlpha(0)
      .setDepth(9000);
    
    const block = this.scene.add.image(0, 0, BlockTexture.key).setScale(BlockTexture.scale);
    const blockTitle = this.scene.add.image(-200, -240, BlockTitleTexture.key).setScale(BlockTitleTexture.scale);
    const text = this.scene.add.text(-200, -240, pauseText.translate.toUpperCase(), { fontSize: 40, color: '#fff', fontFamily: settings.fontFamily }).setOrigin(0.5).setRotation(-0.05);

    const stars = new UiStars(this.scene, 180, -220, starsCount);
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
    this.container.add(stars);

    const task1 = new PauseTask(this.scene, 70, -100, 'Убить 5 белок из ав то м а та та та тат и потом та', 1, true, 1);
    const task2 = new PauseTask(this.scene, 70, 20, 'Task 2', 2, false, 2);
    const task3 = new PauseTask(this.scene, 70, 140, 'Task 3', 3, true, 3);
    this.container.add(task1);
    this.container.add(task2);
    this.container.add(task3);
  }
}