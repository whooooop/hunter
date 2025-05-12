import * as Phaser from 'phaser';
import { GameplayScene } from './game/scenes/GameplayScene/GameplayScene';
import { logger } from './utils/logger';
import { SceneKeys } from './game/scenes';
import { BootScene } from './game/scenes/BootScene';
import { isSupportedLocale, setDefaultLocale } from './utils/i18n';
import { MenuScene } from './game/scenes/MenuScene/MenuScene';
import { PlayerService } from './game/core/services/PlayerService';
import { introFontRegular, introFontBold } from './game/assets/fonts/intro';
import { FontLoader } from './utils/font';
import { DISPLAY } from './game/config';
import { SettingsService } from './game/core/services/SettingsService';

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
  width: DISPLAY.WIDTH,
  height: DISPLAY.HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    // arcade: {
    //   // gravity: { x: 0, y: 0 },
    //   debug: false
    // }
  },
  scene: [
    BootScene,
    GameplayScene,
    MenuScene
  ]
};

async function initGame() {
  try {
    const locale = window.location.search.split('locale=')[1];
    if (isSupportedLocale(locale)) {
      setDefaultLocale(locale);
    } else {
      setDefaultLocale('en');
    }
    const playerService = PlayerService.getInstance();
    const settingsService = SettingsService.getInstance();

    await Promise.all([
      FontLoader(introFontRegular.name, introFontRegular.sources),
      FontLoader(introFontBold.name, introFontBold.sources),
      settingsService.init(),
      playerService.initPlayer()
    ]);

    const game = new Phaser.Game(config);
    game.scene.start(SceneKeys.BOOT);
  } catch (error) {
    logger.error('Error', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initGame();
}); 