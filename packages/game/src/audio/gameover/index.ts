import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import gameoverMusicUrl from './assets/gameover1.mp3';
import gameoverMusicUrl2 from './assets/gameover2.mp3';
import gameoverMusicUrl3 from './assets/gameover3.mp3';

export const GameoverAudio: Audio.Asset = {
  url: gameoverMusicUrl,
  key: 'gameover_music',
  volume: 1,
  type: Audio.Type.Effect
};

export const GameoverAudio2: Audio.Asset = {
  url: gameoverMusicUrl2,
  key: 'gameover_music2',
  volume: 1,
  type: Audio.Type.Effect
};

export const GameoverAudio3: Audio.Asset = {
  url: gameoverMusicUrl3,
  key: 'gameover_music3',
  volume: 1,
  type: Audio.Type.Effect
};

const gameoverAudio = [
  GameoverAudio,
  GameoverAudio2,
  GameoverAudio3,
];

export const preloadGameoverAudio = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, GameoverAudio);
  AudioService.preloadAsset(scene, GameoverAudio2);
  AudioService.preloadAsset(scene, GameoverAudio3);
};

export const playGameoverAudio = (scene: Phaser.Scene) => {
  const randomAudio = gameoverAudio[Math.floor(Math.random() * gameoverAudio.length)];
  AudioService.playAudio(scene, randomAudio.key);
};