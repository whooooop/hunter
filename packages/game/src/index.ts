import { SpinePlugin } from "@esotericsoftware/spine-phaser";
import * as Phaser from 'phaser';
import { introFontBold, introFontRegular } from './assets/fonts/intro';
import { DEBUG, DISPLAY } from './config';
import { SceneKeys } from './scenes';
import { BootScene } from './scenes/BootScene';
import { GameplayScene } from './scenes/GameplayScene';
import { MenuScene } from './scenes/MenuScene/MenuScene';
import { ReloadScene } from './scenes/ReloadScene';
import { PlayerService } from './services/PlayerService';
import { SettingsService } from './services/SettingsService';
import { FontLoader } from './utils/font';
import { isSupportedLocale, setDefaultLocale } from './utils/i18n';
import { logger } from './utils/logger';

const originalLog = console.log;
console.log = function (msg: any) {
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
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: DEBUG.PHYSICS
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
    BootScene,
    GameplayScene,
    MenuScene,
    ReloadScene
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