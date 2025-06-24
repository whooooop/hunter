import { DISPLAY, FONT_FAMILY } from "../../config";
import { UiReplayButton } from "../../ui/ReplayButton";
import { GameOverTexture3, TextTexture } from "./textures";

import { ClickSound, preloadClickSound } from "../../audio/click";
import { emitEvent } from "../../GameEvents";
import { LevelId } from "../../levels";
import { AudioService } from "../../services/AudioService";
import { StatsService } from "../../services/StatsService";
import { Game } from "../../types";
import { UiVideoButton } from "../../ui";
import { BackgroundTexture, GameOverTexture1, GameOverTexture2, TitleTexture } from "./textures";
import { bestScoreText, exitText1, exitText2, exitText3, gameOverText, killsText, scoreText, timeText, tryAgainText1, tryAgainText2, tryAgainText3, watchVideoText } from "./translates";

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
  private container!: Phaser.GameObjects.Container;
  private overlay!: Phaser.GameObjects.Rectangle;
  private depth: number = 1100;
  private isOpen: boolean = false;

  static preload(scene: Phaser.Scene) {
    UiReplayButton.preload(scene);
    UiVideoButton.preload(scene);
    preloadClickSound(scene);
    scene.load.image(TextTexture.key, TextTexture.url);
    scene.load.image(BackgroundTexture.key, BackgroundTexture.url);
    scene.load.image(TitleTexture.key, TitleTexture.url);
    scene.load.image(GameOverTexture1.key, GameOverTexture1.url);
    scene.load.image(GameOverTexture2.key, GameOverTexture2.url);
    scene.load.image(GameOverTexture3.key, GameOverTexture3.url);
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // this.open({ attempt: 1, time: 0, kills: 0 });
  }

  open({ attempt = 1, time = 0, kills = 0, showReplay = false, score = 0, levelId, showContinueWithAds = false }: { attempt: number, time: number, kills: number, showReplay: boolean, score: number, levelId: LevelId, showContinueWithAds: boolean }) {
    if (this.isOpen) return;
    this.container = this.scene.add.container(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2).setDepth(this.depth + 1);
    this.overlay = this.scene.add.rectangle(0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT, 0x000000, 0.5).setAlpha(0).setOrigin(0).setDepth(this.depth);

    this.isOpen = true;
    this.container.setScale(0).setAlpha(0);
    this.overlay.setAlpha(0);

    this.render(attempt, time, kills, score, showReplay, levelId, showContinueWithAds);

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

  close() {
    this.isOpen = false;
    this.scene.tweens.add({
      ease: Phaser.Math.Easing.Bounce.Out,
      targets: this.container,
      scale: 0,
      alpha: 0,
      duration: 500,
      delay: 400,
      onComplete: () => {
        this.destroy();
      }
    });

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 500,
    });
  }

  render(attempt: number, time: number, kills: number, score: number, showReplay: boolean, levelId: LevelId, showContinueWithAds: boolean) {
    const variant = variants[Math.max(attempt - 1, 0) % variants.length];
    const stats = StatsService.getLevelStats(levelId);

    const background = this.scene.add.image(0, 0, BackgroundTexture.key).setOrigin(0.5).setScale(BackgroundTexture.scale);
    this.container.add(background);

    const titleContainer = this.scene.add.container(50, -190);
    const title = this.scene.add.image(0, 0, TitleTexture.key).setOrigin(0.5).setScale(TitleTexture.scale);
    const titleText = this.scene.add.text(0, 0, gameOverText.translate.toUpperCase(), { fontSize: 46, fontFamily: FONT_FAMILY.BOLD, color: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
    titleContainer.add(title);
    titleContainer.add(titleText);
    this.container.add(titleContainer);

    const attemptImage = this.scene.add.image(-280, -170, variant.texture.key).setOrigin(0.5).setScale(variant.texture.scale);
    this.container.add(attemptImage);

    if (showReplay) {
      const replayContainer = this.scene.add.container(340, 80).setScale(0.96);
      const replayText = this.scene.add.text(-100, 0, variant.replayText.translate, { fontSize: 20, fontFamily: FONT_FAMILY.REGULAR, color: '#000' }).setOrigin(0, 0.5);
      const replayBackground = this.scene.add.image(0, 0, TextTexture.key).setOrigin(0.5).setScale(TextTexture.scale);
      const replayButton = new UiReplayButton(this.scene, -170, 0);
      replayButton.on('pointerdown', () => emitEvent(this.scene, Game.Events.Replay.Local, {}));
      replayContainer.add(replayBackground);
      replayContainer.add(replayText);
      replayContainer.add(replayButton);
      this.container.add(replayContainer);
    }

    if (showContinueWithAds) {
      let waitingRewarded = false;
      const videoContainer = this.scene.add.container(340, -50).setScale(0.96);
      const videoBackground = this.scene.add.image(0, 0, TextTexture.key).setOrigin(0.5).setScale(TextTexture.scale);
      const videoText = this.scene.add.text(-100, 0, watchVideoText.translate, { fontSize: 20, fontFamily: FONT_FAMILY.REGULAR, color: '#000' }).setOrigin(0, 0.5).setWordWrapWidth(200);
      const videoButton = new UiVideoButton(this.scene, -170, 0);
      videoButton.on('pointerdown', () => {
        if (waitingRewarded) return;
        waitingRewarded = true;

        const handle = (state: string) => {
          if (state === 'rewarded') {
            window.bridge.advertisement.off(window.bridge.EVENT_NAME.REWARDED_STATE_CHANGED, handle);
            waitingRewarded = false;
            emitEvent(this.scene, Game.Events.ResumeWithAds.Local, {})
          } else if (state === 'failed') {
            window.bridge.advertisement.off(window.bridge.EVENT_NAME.REWARDED_STATE_CHANGED, handle);
            waitingRewarded = false;
          }
        }
        window.bridge.advertisement.on(window.bridge.EVENT_NAME.REWARDED_STATE_CHANGED, handle);
        window.bridge.advertisement.showRewarded();
      });
      videoContainer.add(videoBackground);
      videoContainer.add(videoButton);
      videoContainer.add(videoText);
      this.container.add(videoContainer);
    }

    const exitContainer = this.scene.add.container(120, 170);
    const exitText = this.scene.add.text(0, 0, variant.exitText.translate.toUpperCase(), { fontSize: 12, fontFamily: FONT_FAMILY.REGULAR, color: '#000' }).setOrigin(0.5);
    const exitBackground = this.scene.add.image(0, 0, TextTexture.key).setOrigin(0.5).setScale(TextTexture.scale * 0.6);
    exitBackground.setInteractive();
    exitBackground.on('pointerover', () => exitContainer.setScale(1.1));
    exitBackground.on('pointerout', () => exitContainer.setScale(1));
    exitBackground.on('pointerdown', () => {
      emitEvent(this.scene, Game.Events.Exit.Local, {})
      AudioService.playAudio(this.scene, ClickSound.key);
    });
    exitContainer.add(exitBackground);
    exitContainer.add(exitText);
    this.container.add(exitContainer);

    const fontSize = 24;
    const fontFamily = FONT_FAMILY.REGULAR;
    const minutes = Math.floor(time / 1000 / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time / 1000 % 60).toString().padStart(2, '0');
    const x = -130;
    const y = -50;
    const timeTextElement = this.scene.add.text(x, y, timeText.translate.toUpperCase() + ' ' + minutes + ':' + seconds, { fontSize, fontFamily, color: '#fff' }).setOrigin(0, 0.5);
    const killsTextElement = this.scene.add.text(x, y + 40, killsText.translate.toUpperCase() + ' ' + kills, { fontSize, fontFamily, color: '#fff' }).setOrigin(0, 0.5);
    const scoreTextElement = this.scene.add.text(x, y + 80, scoreText.translate.toUpperCase() + ' ' + score, { fontSize, fontFamily, color: '#fff' }).setOrigin(0, 0.5);
    const bestScoreTextElement = this.scene.add.text(x, y + 120, bestScoreText.translate.toUpperCase() + ' ' + stats.bestScore, { fontSize, fontFamily, color: '#fff' }).setOrigin(0, 0.5);
    this.container.add(timeTextElement);
    this.container.add(killsTextElement);
    this.container.add(scoreTextElement);
    this.container.add(bestScoreTextElement);
  }

  destroy() {
    this.container.destroy();
    this.overlay.destroy();
    this.isOpen = false;
  }
}