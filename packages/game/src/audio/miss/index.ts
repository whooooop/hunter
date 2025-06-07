import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import missSoundUrl from './assets/miss1.mp3';
import missSoundUrl2 from './assets/miss2.mp3';

export const MissSound: Audio.Asset = {
  url: missSoundUrl,
  key: 'miss_sound',
  volume: 0.6,
  type: Audio.Type.Effect
};

export const MissSound2: Audio.Asset = {
  url: missSoundUrl2,
  key: 'miss_sound2',
  volume: 0.6,
  type: Audio.Type.Effect
};

export const preloadMissSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, MissSound);
  AudioService.preloadAsset(scene, MissSound2);
};

export const playMissSound = (scene: Phaser.Scene) => {
  const random = Phaser.Math.FloatBetween(0, 1);
  if (random < 0.5) {
    return;
  }

  if (random < 0.8) {
    AudioService.playAudio(scene, MissSound.key);
  } else {
    AudioService.playAudio(scene, MissSound2.key);
  }
};