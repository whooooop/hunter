import * as Phaser from 'phaser';
import { SceneKeys } from '../core/Constants';
import { settings } from '../settings';
import { createLogger } from '../../utils/logger';

const logger = createLogger('LoadingScene');

/**
 * Сцена загрузки игры
 */
export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.LOADING });
  }
  
  preload(): void {
    this.loadCommonAssets();
  }
  
  create(): void {
    logger.info('Загрузка завершена. Запускаем игру в лесной локации');
    
    // Запускаем игровую сцену с лесной локацией
    this.scene.start(SceneKeys.GAMEPLAY, { locationId: 'forest' });
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
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, progressBarWidth, progressBarHeight);
    
    // Создаем сам прогресс-бар
    const progressBar = this.add.graphics();
    
    // Текст загрузки
    const loadingText = this.add.text(
      settings.display.width / 2, 
      y - 30,
      'Загрузка...', 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    // Процент загрузки
    const percentText = this.add.text(
      settings.display.width / 2, 
      y + 50,
      '0%', 
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    // Слушаем события загрузки
    this.load.on('progress', (value: number) => {
      // Очищаем прогресс-бар
      progressBar.clear();
      // Рисуем прогресс-бар
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(x, y, progressBarWidth * value, progressBarHeight);
      // Обновляем текст процента
      percentText.setText(`${Math.floor(value * 100)}%`);
    });
    
    // Когда загрузка завершена
    this.load.on('complete', () => {
      // Удаляем элементы UI загрузки
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
  
} 