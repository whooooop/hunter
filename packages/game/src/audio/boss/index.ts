import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import bossSoundUrl from './assets/boss.mp3';

export const BossSound: Audio.Asset = {
  url: bossSoundUrl,
  key: 'boss_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const preloadBossSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, BossSound);
};

export const playBossSound = (scene: Phaser.Scene) => {
  AudioService.playAudio(scene, BossSound.key);
};