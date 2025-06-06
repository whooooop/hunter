import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import dangerSoundUrl from './assets/danger.mp3';

export const DangerSound: Audio.Asset = {
  url: dangerSoundUrl,
  key: 'danger_sound',
  volume: 1,
  type: Audio.Type.Effect
};

export const preloadDangerSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, DangerSound);
};

export const playDangerSound = (scene: Phaser.Scene) => {
  AudioService.playAudio(scene, DangerSound.key);
};