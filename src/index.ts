import * as Phaser from 'phaser';
import { GameplayScene } from './game/scenes/GameplayScene';
import { WORLD_BOUNDS } from './game/core/Constants';

// Конфигурация игры
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: WORLD_BOUNDS.width,
  height: WORLD_BOUNDS.height,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true
    }
  },
  scene: [GameplayScene]
};

// Проверяем, что загружается в браузере
window.addEventListener('DOMContentLoaded', () => {
  console.log('Инициализация игры Охотник');
  
  try {
    // Создаем экземпляр игры
    const game = new Phaser.Game(config);
    
    console.log('Игра инициализирована успешно');
  } catch (error) {
    console.error('Ошибка при инициализации игры:', error);
  }
}); 