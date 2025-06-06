import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import clickSoundUrl from './assets/click.mp3';

export const ClickSound: Audio.Asset = {
  url: clickSoundUrl,
  key: 'click_sound',
  volume: 1,
  type: Audio.Type.Interface
};

export const preloadClickSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, ClickSound);
};
