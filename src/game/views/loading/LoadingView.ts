import * as Phaser from 'phaser';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { BackgroundView } from '../background/BackgroundView';

const logger = createLogger('LoadingScene');

/**
 * Сцена загрузки игры
 */
export class LoadingView {
  private scene: Phaser.Scene;
  private backgroundView!: BackgroundView;
  private backgroundContainer!: Phaser.GameObjects.Container;
  private progressContainer!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.backgroundContainer = this.scene.add.container(0, 0).setDepth(10000);
    this.progressContainer = this.scene.add.container(0, 0).setDepth(10000);

    console.log('LoadingScene create');
    this.backgroundView = new BackgroundView(this.scene, this.backgroundContainer);
    
    if (this.scene.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      this.backgroundContainer.postFX.addBlur();
    } else {
      logger.warn('CanvasRenderer detected. Blur effect is not supported.');
    }
   
    this.loadCommonAssets();
  }

  static preload(scene: Phaser.Scene): void {
    console.log('LoadingScene preload');
    BackgroundView.preload(scene);
  }

  update(time: number, delta: number): void {
    this.backgroundView.update(time, delta);
  }
  
  /**
   * Загрузка общих ресурсов для всей игры
   */
  private loadCommonAssets(): void {
    const progressBarWidth = 320;
    const progressBarHeight = 30;
    const x = settings.display.width / 2 - progressBarWidth / 2;
    const y = settings.display.height / 2;

    // Создаем фон прогресс-бара
    const progressBox = this.scene.add.graphics().setDepth(100);
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, progressBarWidth, progressBarHeight);
    
    // Создаем сам прогресс-бар
    const progressBar = this.scene.add.graphics().setDepth(100);
  
    // Текст загрузки
    const loadingText = this.scene.add.text(
      settings.display.width / 2, 
      y - 30,
      'Загрузка...', 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    // Процент загрузки
    const percentText = this.scene.add.text(
      settings.display.width / 2, 
      y + 50,
      '0%', 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);

    this.progressContainer.add(progressBox);
    this.progressContainer.add(progressBar);
    this.progressContainer.add(loadingText);
    this.progressContainer.add(percentText);
    
    // Слушаем события загрузки
    this.scene.load.on('progress', (value: number) => {
      console.log('progress', value);
      // Очищаем прогресс-бар
      progressBar.clear();
      // Рисуем прогресс-бар
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(x, y, progressBarWidth * value, progressBarHeight);
      // Обновляем текст процента
      percentText.setText(`${Math.floor(value * 100)}%`);
    });
    
    // Когда загрузка завершена
    this.scene.load.on('complete', () => {
      // Удаляем элементы UI загрузки
      // progressBar.destroy();
      // progressBox.destroy();
      // loadingText.destroy();
      // percentText.destroy();
      // поавное исчезновение
      
    });
  }
  
  destroy(): void {
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
      duration: 600,
      ease: 'Power2',
      delay: 1200,
      onComplete: () => { 
        this.progressContainer.destroy();
      }
    });
  }
} 