import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import runSoundUrl from './assets/run.mp3';

export const RunSound: Audio.Asset = {
  url: runSoundUrl,
  key: 'run_sound',
  volume: 1,
  type: Audio.Type.Effect
};

export const preloadRunSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, RunSound);
};

export const playRunSound = (scene: Phaser.Scene) => {
  const random = Phaser.Math.FloatBetween(0, 1);
  if (random < 0.5) {
    return;
  }

  if (random < 0.8) {
    AudioService.playAudio(scene, RunSound.key);
  }
};