import { preloadAudio } from '../../preload';
import { Audio } from '../../types';
import clickSoundUrl from './assets/click.mp3';

export const ClickSound: Audio.Asset = {
  url: clickSoundUrl,
  key: 'click_sound',
  volume: 1,
  type: Audio.Type.Interface
};

export const preloadClickSound = (scene: Phaser.Scene) => {
  preloadAudio(scene, ClickSound.key, ClickSound.url);
};
