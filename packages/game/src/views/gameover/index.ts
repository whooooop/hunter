import { DISPLAY, FONT_FAMILY } from "../../config";
import { UiReplayButton } from "../../ui/ReplayButton";
import { GameOverTexture3, TextTexture } from "./textures";

import { emitEvent } from "../../GameEvents";
import { Game } from "../../types";
import { clickAudio } from "../../ui/Button";
import { BackgroundTexture, GameOverTexture1, GameOverTexture2, TitleTexture } from "./textures";
import { exitText1, exitText2, exitText3, gameOverText, killsText, timeText, tryAgainText1, tryAgainText2, tryAgainText3 } from "./translates";

const variants = [
  {
    texture: GameOverTexture1,
    replayText: tryAgainText1,
    exitText: exitText1,
  },
  {
    texture: GameOverTexture2,
    replayText: tryAgainText2,
    exitText: exitText2,
  },
  {
    texture: GameOverTexture3,
    replayText: tryAgainText3,
    exitText: exitText3,
  },
]

export class GameOverView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Rectangle;
  private depth: number = 1100;
  private isOpen: boolean = false;

  static preload(scene: Phaser.Scene) {
    UiReplayButton.preload(scene);

    scene.load.image(TextTexture.key, TextTexture.url);
    scene.load.image(BackgroundTexture.key, BackgroundTexture.url);
    scene.load.image(TitleTexture.key, TitleTexture.url);
    scene.load.image(GameOverTexture1.key, GameOverTexture1.url);
    scene.load.image(GameOverTexture2.key, GameOverTexture2.url);
    scene.load.image(GameOverTexture3.key, GameOverTexture3.url);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2).setDepth(this.depth + 1);
    this.overlay = this.scene.add.rectangle(0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT, 0x000000, 0.5).setAlpha(0).setOrigin(0).setDepth(this.depth);
    // this.open({ attempt: 1, time: 0, kills: 0 });
  }

  open({ attempt = 1, time = 0, kills = 0, showReplay = false }: { attempt: number, time: number, kills: number, showReplay: boolean }) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.setScale(0).setAlpha(0);
    this.overlay.setAlpha(0);

    this.render(attempt, time, kills, showReplay);

    this.scene.tweens.add({
      ease: Phaser.Math.Easing.Bounce.Out,
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 500,
      delay: 400,
    });

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 1,
      duration: 500,
    });
  }


  render(attempt: number, time: number, kills: number, showReplay: boolean) {
    const variant = variants[Math.max(attempt - 1, 0) % variants.length];

    const background = this.scene.add.image(0, 0, BackgroundTexture.key).setOrigin(0.5).setScale(BackgroundTexture.scale);
    this.container.add(background);

    const titleContainer = this.scene.add.container(50, -190);
    const title = this.scene.add.image(0, 0, TitleTexture.key).setOrigin(0.5).setScale(TitleTexture.scale);
    const titleText = this.scene.add.text(0, 0, gameOverText.translate.toUpperCase(), { fontSize: 46, fontFamily: FONT_FAMILY.BOLD, color: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
    titleContainer.add(title);
    titleContainer.add(titleText);
    this.container.add(titleContainer);

    const attemptImage = this.scene.add.image(-240, -170, variant.texture.key).setOrigin(0.5).setScale(variant.texture.scale);
    this.container.add(attemptImage);


    if (showReplay) {
      const replayContainer = this.scene.add.container(50, 100);
      const replayText = this.scene.add.text(-100, 0, variant.replayText.translate, { fontSize: 20, fontFamily: FONT_FAMILY.REGULAR, color: '#000' }).setOrigin(0, 0.5);
      const replayBackground = this.scene.add.image(0, 0, TextTexture.key).setOrigin(0.5).setScale(TextTexture.scale);
      const replayButton = new UiReplayButton(this.scene, -170, 0);
      replayButton.on('pointerdown', () => emitEvent(this.scene, Game.Events.Replay.Local, {}));
      replayContainer.add(replayBackground);
      replayContainer.add(replayText);
      replayContainer.add(replayButton);
      this.container.add(replayContainer);
    }

    const exitContainer = this.scene.add.container(110, 170);
    const exitText = this.scene.add.text(0, 0, variant.exitText.translate.toUpperCase(), { fontSize: 12, fontFamily: FONT_FAMILY.REGULAR, color: '#000' }).setOrigin(0.5);
    const exitBackground = this.scene.add.image(0, 0, TextTexture.key).setOrigin(0.5).setScale(TextTexture.scale * 0.6);
    exitBackground.setInteractive();
    exitBackground.on('pointerover', () => exitContainer.setScale(1.1));
    exitBackground.on('pointerout', () => exitContainer.setScale(1));
    exitBackground.on('pointerdown', () => {
      emitEvent(this.scene, Game.Events.Exit.Local, {})
      this.scene.sound.play(clickAudio.key);
    });
    exitContainer.add(exitBackground);
    exitContainer.add(exitText);
    this.container.add(exitContainer);

    const minutes = Math.floor(time / 1000 / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time / 1000 % 60).toString().padStart(2, '0');
    const timeTextElement = this.scene.add.text(-100, -56, timeText.translate.toUpperCase() + ' ' + minutes + ':' + seconds, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#fff' }).setOrigin(0, 0.5);
    const killsTextElement = this.scene.add.text(-100, 0, killsText.translate.toUpperCase() + ' ' + kills, { fontSize: 26, fontFamily: FONT_FAMILY.REGULAR, color: '#fff' }).setOrigin(0, 0.5);
    this.container.add(timeTextElement);
    this.container.add(killsTextElement);
  }

  destroy() {
    this.container.destroy();
    this.overlay.destroy();
    this.isOpen = false;
  }
}