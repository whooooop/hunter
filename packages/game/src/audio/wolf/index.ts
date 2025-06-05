import { preloadAudio } from '../../preload';
import { Audio } from '../../types';
import wolfSoundUrl from './assets/wolf.mp3';

export const WolfSound: Audio.Asset = {
  url: wolfSoundUrl,
  key: 'wolf_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const preloadWolfSound = (scene: Phaser.Scene) => {
  preloadAudio(scene, WolfSound.key, WolfSound.url);
};
