import * as Phaser from 'phaser';
import { GameplayScene } from './game/scenes/GameplayScene';
import { settings } from './game/settings';
import { logger } from './utils/logger';

// Конфигурация игры
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: settings.display.width,
  height: settings.display.height,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [GameplayScene]
};

function initGame() {
  try {
    logger.info('Инициализация игры Охотник');
    
    // Создаем экземпляр игры
    const game = new Phaser.Game(config);
    
    logger.info('Игра инициализирована успешно');
  } catch (error) {
    logger.error('Ошибка при инициализации игры:', error);
  }
}

// Проверяем, что загружается в браузере
window.addEventListener('DOMContentLoaded', () => {
  initGame();
}); 