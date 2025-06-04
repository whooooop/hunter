import * as Phaser from 'phaser';
import loadingBackgroundUrl from '../../assets/images/loading_background.png';
import loadingLeftUrl from '../../assets/images/loading_left.png';
import loadingProgressUrl from '../../assets/images/loading_progress.png';
import loadingRightUrl from '../../assets/images/loading_right.png';
import { DISPLAY, FONT_FAMILY, LOADING_EXTRA_DURATION } from '../../config';
import { emitEvent } from '../../GameEvents';
import { loadAssets } from '../../preload';
import { Loading } from '../../types';
import { createLogger } from '../../utils/logger';
import { BackgroundView } from '../background/BackgroundView';
import { LoadingText } from './translates';

const logger = createLogger('LoadingScene');

const loadingBackground = {
  key: 'progress_background',
  url: loadingBackgroundUrl,
  scale: 0.5
}

const loadingLeft = {
  key: 'progress_background_left',
  url: loadingLeftUrl,
  scale: 0.5
}

const loadingRight = {
  key: 'progress_background_right',
  url: loadingRightUrl,
  scale: 0.5
}

const loadingProgress = {
  key: 'progress_progress',
  url: loadingProgressUrl,
  scale: 0.5
}

export class LoadingView {
  private scene: Phaser.Scene;
  private backgroundView!: BackgroundView;
  private backgroundContainer!: Phaser.GameObjects.Container;
  private progressContainer!: Phaser.GameObjects.Container;
  private rightProgress!: Phaser.GameObjects.Image;
  private progressBar!: Phaser.GameObjects.Image;

  private minLoadingTime = 0;
  private maxProgressScale = 272;

  constructor(scene: Phaser.Scene, options?: { minLoadingTime: number }) {
    this.scene = scene;
    this.minLoadingTime = LOADING_EXTRA_DURATION;
    this.backgroundContainer = this.scene.add.container(0, 0).setDepth(10000);
    this.progressContainer = this.scene.add.container(0, 0).setDepth(10000);
    this.backgroundView = new BackgroundView(this.scene);
    this.backgroundContainer.add(this.backgroundView.getContainer());

    if (this.scene.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      this.backgroundContainer.postFX.addBlur();
    } else {
      logger.warn('CanvasRenderer detected. Blur effect is not supported.');
    }

    this.loadCommonAssets();
  }

  static preload(scene: Phaser.Scene): void {
    BackgroundView.preload(scene);
    scene.load.image(loadingBackground.key, loadingBackground.url);
    scene.load.image(loadingLeft.key, loadingLeft.url);
    scene.load.image(loadingRight.key, loadingRight.url);
    scene.load.image(loadingProgress.key, loadingProgress.url);
  }

  update(time: number, delta: number): void {
    this.backgroundView.update(time, delta);
  }

  private loadCommonAssets(): void {
    window.bridge.platform.sendMessage("in_game_loading_started");

    const progressBarWidth = 608;
    const center = {
      x: DISPLAY.WIDTH / 2,
      y: DISPLAY.HEIGHT / 2
    }
    const background = this.scene.add.image(center.x, center.y, loadingBackground.key).setScale(loadingBackground.scale);
    const leftProgress = this.scene.add.image(center.x - progressBarWidth / 2 + 18, center.y, loadingLeft.key).setScale(loadingLeft.scale);
    this.rightProgress = this.scene.add.image(center.x + progressBarWidth / 2 - 17, center.y, loadingRight.key).setScale(loadingRight.scale).setVisible(false);
    this.progressBar = this.scene.add.image(center.x - progressBarWidth / 2 + 32, center.y, loadingProgress.key).setOrigin(0, 0.5).setScale(0, loadingProgress.scale);

    const loadingText = this.scene.add.text(
      DISPLAY.WIDTH / 2,
      center.y,
      LoadingText.translate,
      { fontSize: '26px', color: '#ffffff', fontFamily: FONT_FAMILY.BOLD }
    ).setOrigin(0.5);

    this.progressContainer.add(background);
    this.progressContainer.add(leftProgress);
    this.progressContainer.add(this.progressBar);
    this.progressContainer.add(this.rightProgress);
    this.progressContainer.add(loadingText);

    loadAssets(this.scene, this.minLoadingTime, (progress: number) => {
      this.progressBar.setScale(this.maxProgressScale * progress, loadingProgress.scale);
      if (progress === 1) {
        this.rightProgress.setVisible(true);
        window.bridge.platform.sendMessage("in_game_loading_stopped");
        this.finishLoading();
      }
    });
  }

  private finishLoading(): void {
    this.scene.tweens.add({
      targets: this.backgroundContainer,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.backgroundContainer.destroy();
      }
    });
    this.scene.tweens.add({
      targets: this.progressContainer,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.progressContainer.destroy();
      }
    });

    emitEvent(this.scene, Loading.Events.LoadingComplete.Local, {});
  }

  setHint(hint: string): void {
    const text = this.scene.add.text(
      DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2 + 180,
      hint,
      { fontSize: '26px', color: '#ffffff', fontFamily: FONT_FAMILY.REGULAR, align: 'center' }
    ).setOrigin(0.5).setWordWrapWidth(500);

    this.progressContainer.add(text);
  }

  destroy(): void {

  }
} 