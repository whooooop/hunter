import * as Phaser from 'phaser';
import { GameplayScene } from './game/scenes/GameplayScene/GameplayScene';
import { settings } from './game/settings';
import { logger } from './utils/logger';
import { MainMenuScene } from './game/scenes/MainMenuScene/MainMenuScene';
import { ShopScene } from './game/scenes/ShopScene/ShopScene';
import { SettingsScene } from './game/scenes/SettingsScene/SettingsScene';
import { MultiplayerScene } from './game/scenes/MultiplayerScene/MultiplayerScene';
import { SceneKeys } from './game/scenes';
import { BootScene } from './game/scenes/BootScene';
import { setDefaultLocale } from './utils/i18n';

const originalLog = console.log;
console.log = function(msg: any) {
    if (
        typeof msg === 'string' &&
        msg.includes('Phaser v3.88')
    ) {
        return;
    }
    originalLog.call(console, ...arguments);
};

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
  scene: [
    BootScene,
    GameplayScene,
    MainMenuScene,
    ShopScene,
    SettingsScene,
    MultiplayerScene
  ]
};

function initGame() {
  try {
    setDefaultLocale('ru');
    const game = new Phaser.Game(config);
    game.scene.start(SceneKeys.BOOT);
  } catch (error) {
    logger.error('Error', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initGame();
}); 