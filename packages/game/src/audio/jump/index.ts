import { preloadAudio } from '../../preload';
import { Audio } from '../../types';
import jumpSoundUrl from './assets/jump.mp3';

export const JumpSound: Audio.Asset = {
  url: jumpSoundUrl,
  key: 'jump_sound',
  volume: 1,
  type: Audio.Type.Interface
};

export const preloadJumpSound = (scene: Phaser.Scene) => {
  preloadAudio(scene, JumpSound.key, JumpSound.url);
};
