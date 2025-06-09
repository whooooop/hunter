import { SpinePlugin } from "@esotericsoftware/spine-phaser";
import * as Phaser from 'phaser';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import RexUI from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import { introFontBold, introFontRegular } from './assets/fonts/intro';
import { DEBUG, DISPLAY } from './config';
import playgamaBridgeConfigUrl from './playgama-bridge-config.json';
import { SceneKeys } from './scenes';
import { BootScene } from './scenes/BootScene';
import { GameplayScene } from './scenes/GameplayScene';
import { MenuScene } from './scenes/MenuScene/MenuScene';
import { ReloadScene } from './scenes/ReloadScene';
import { AudioService } from './services/AudioService';
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
  type: Phaser.AUTO,
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
  dom: {
    createContainer: true
  },
  input: {
    activePointers: 2,
  },
  plugins: {
    scene: [{
      key: "spine.SpinePlugin",
      plugin: SpinePlugin,
      mapping: "spine"
    }, {
      key: "rexUI",
      plugin: RexUI,
      mapping: "rexUI",
    }],
    global: [{
      key: "rexOutlinePipeline",
      plugin: OutlinePipelinePlugin,
      mapping: "rexOutlinePipeline",
    }]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    // zoom: 1 / window.devicePixelRatio
  },
  autoRound: false,
  scene: [
    BootScene,
    GameplayScene,
    MenuScene,
    ReloadScene
  ]
};

async function initBridge() {
  return window.bridge.initialize({
    configFilePath: playgamaBridgeConfigUrl
  })
    .then(() => {
      const lang = window.location.search.split('locale=')[1] || window.bridge.platform.language;
      if (isSupportedLocale(lang)) {
        setDefaultLocale(lang);
      } else {
        setDefaultLocale('en');
      }

      if (window.bridge.game.visibilityState === "hidden") {
        AudioService.setGlobalMute(true, 'VISIBILITY');
      }

      window.bridge.game.on(window.bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED, (state: string) => {
        if (state === "hidden") {
          AudioService.setGlobalMute(true, 'VISIBILITY');
        } else {
          AudioService.setGlobalMute(false, 'VISIBILITY');
        }
      });
    })
    .catch((error: any) => {
      console.error('Playgama SDK failed to initialize:', error);
    });
}

async function initGame() {
  try {
    const playerService = PlayerService.getInstance();
    const settingsService = SettingsService.getInstance();

    await Promise.all([
      FontLoader(introFontRegular.name, introFontRegular.sources),
      FontLoader(introFontBold.name, introFontBold.sources),
      settingsService.init(),
      playerService.initPlayer(),
      AudioService.init()
    ]);

    const game = new Phaser.Game(config);
    game.scene.start(SceneKeys.BOOT);
  } catch (error) {
    logger.error('Error', error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await initBridge();
  await initGame();
});




// this.sound.unlock();
// как поменять громкость текущего звука?
// Глобальный мьют 

// var music = this.sound.add(key, config);
// music.setVolume(volume); 
// music.setMute(mute); // mute: true/false
// music.once("volume", function (music, volume) {});
// music.once("complete", function (music) {});


// this.sound.setMute(mute); // mute: true/false
// var mute = this.sound.mute;
// this.sound.setVolume(volume); // volume: 0 to 1

// var musicArray = this.sound.getAllPlaying();

// var stopped = this.sound.stopByKey(key);
// this.sound.stopAll();