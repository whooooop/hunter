import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import damageSoundUrl from './assets/damage.mp3';
import damageSoundUrl2 from './assets/damage2.mp3';

export const DamageSound: Audio.Asset = {
  url: damageSoundUrl,
  key: 'damage_sound',
  volume: 1,
  type: Audio.Type.Effect
};

export const DamageSound2: Audio.Asset = {
  url: damageSoundUrl2,
  key: 'damage_sound2',
  volume: 1,
  type: Audio.Type.Effect
};

export const preloadDamageSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, DamageSound);
  AudioService.preloadAsset(scene, DamageSound2);
};

export const playDamageSound = (scene: Phaser.Scene) => {
  const random = Phaser.Math.FloatBetween(0, 1);
  if (random < 0.6) {
    AudioService.playAudio(scene, DamageSound.key);
  } else {
    AudioService.playAudio(scene, DamageSound2.key);
  }
};