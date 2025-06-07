import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import killDoubleSoundUrl from './assets/kill_double.mp3';
import killMonsterSoundUrl from './assets/kill_monster.mp3';
import killTripleSoundUrl from './assets/kill_triple.mp3';
import killUltraKillSoundUrl from './assets/kill_ultra.mp3';

export const KillDoubleSound: Audio.Asset = {
  url: killDoubleSoundUrl,
  key: 'kill_double_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const KillTripleSound: Audio.Asset = {
  url: killTripleSoundUrl,
  key: 'kill_triple_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const KillUltraSound: Audio.Asset = {
  url: killUltraKillSoundUrl,
  key: 'kill_ultra_kill_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const KillMonsterSound: Audio.Asset = {
  url: killMonsterSoundUrl,
  key: 'kill_monster_sound',
  volume: 1,
  type: Audio.Type.Ambience
};

export const preloadKillSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, KillDoubleSound);
  AudioService.preloadAsset(scene, KillTripleSound);
  AudioService.preloadAsset(scene, KillUltraSound);
  AudioService.preloadAsset(scene, KillMonsterSound);
};
