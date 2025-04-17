import * as Phaser from 'phaser';
import { GameplayScene } from './game/scenes/GameplayScene/GameplayScene';
import { LoadingScene } from './game/scenes/LoadingScene';
import { settings } from './game/settings';
import { logger } from './utils/logger';
import { SpinePlugin } from "@esotericsoftware/spine-phaser"
import { MainMenuScene } from './game/scenes/MainMenuScene/MainMenuScene';
import { ShopScene } from './game/scenes/ShopScene/ShopScene';
import { SettingsScene } from './game/scenes/SettingsScene/SettingsScene';
import { MultiplayerScene } from './game/scenes/MultiplayerScene/MultiplayerScene';
import { SceneKeys } from './game/scenes';

// Конфигурация игры
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: settings.display.width,
  height: settings.display.height,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  plugins: {
    scene: [{
      key: "spine.SpinePlugin",
      plugin: SpinePlugin,
      mapping: "spine"
    }]
  },
  scene: [
    GameplayScene,
    MainMenuScene,
    LoadingScene,
    ShopScene,
    SettingsScene,
    MultiplayerScene
  ]
};

function initGame() {
  try {
    logger.info('Инициализация игры Охотник');
    
    // Создаем экземпляр игры
    const game = new Phaser.Game(config);
    // game.scene.start(SceneKeys.MAIN_MENU);
    game.scene.start(SceneKeys.LOADING);
    logger.info('Игра инициализирована успешно');
  } catch (error) {
    logger.error('Ошибка при инициализации игры:', error);
  }
}

// Проверяем, что загружается в браузере
window.addEventListener('DOMContentLoaded', () => {
  initGame();
}); 