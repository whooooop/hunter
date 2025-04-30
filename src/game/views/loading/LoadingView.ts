import * as Phaser from 'phaser';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { BackgroundView } from '../background/BackgroundView';
import loadingBackgroundUrl from '../../assets/images/loading_background.png'
import loadingLeftUrl from '../../assets/images/loading_left.png'
import loadingRightUrl from '../../assets/images/loading_right.png'
import loadingProgressUrl from '../../assets/images/loading_progress.png'
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

  private maxProgressScale = 272;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.backgroundContainer = this.scene.add.container(0, 0).setDepth(10000);
    this.progressContainer = this.scene.add.container(0, 0).setDepth(10000);
    this.backgroundView = new BackgroundView(this.scene, this.backgroundContainer);
    
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
    const progressBarWidth = 608;
    const center = { 
      x: settings.display.width / 2,
      y: settings.display.height / 2
    }
    const background = this.scene.add.image(center.x, center.y, loadingBackground.key).setScale(loadingBackground.scale);
    const leftProgress = this.scene.add.image(center.x - progressBarWidth / 2 + 18, center.y, loadingLeft.key).setScale(loadingLeft.scale);
    this.rightProgress = this.scene.add.image(center.x + progressBarWidth / 2 - 17, center.y, loadingRight.key).setScale(loadingRight.scale).setVisible(false);
    this.progressBar = this.scene.add.image(center.x - progressBarWidth / 2 + 32, center.y, loadingProgress.key).setOrigin(0, 0.5).setScale(0, loadingProgress.scale);
  
    // Текст загрузки
    const loadingText = this.scene.add.text(
      settings.display.width / 2, 
      center.y,
      LoadingText.translate, 
      { fontSize: '26px', fontStyle: 'bold', color: '#ffffff' }
    ).setOrigin(0.5);
    
    this.progressContainer.add(background);
    this.progressContainer.add(leftProgress);
    this.progressContainer.add(this.progressBar);
    this.progressContainer.add(this.rightProgress);
    this.progressContainer.add(loadingText);
    
    this.scene.load.on('progress', (value: number) => {
      this.progressBar.setScale(this.maxProgressScale * value, loadingProgress.scale);
      if (value === 1) {
        this.rightProgress.setVisible(true);
      }
    });
    
    this.scene.load.on('complete', () => {
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
    });
  }
  
  destroy(): void {
    
  }
} 