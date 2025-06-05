import { preloadAudio } from '../../preload';
import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import gameoverMusicUrl from './assets/gameover1.mp3';
import gameoverMusicUrl2 from './assets/gameover2.mp3';
import gameoverMusicUrl3 from './assets/gameover3.mp3';
import gameoverMusicUrl4 from './assets/gameover4.mp3';
import gameoverMusicUrl5 from './assets/gameover5.mp3';

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

export const GameoverAudio4: Audio.Asset = {
  url: gameoverMusicUrl4,
  key: 'gameover_music4',
  volume: 1,
  type: Audio.Type.Effect
};

export const GameoverAudio5: Audio.Asset = {
  url: gameoverMusicUrl5,
  key: 'gameover_music5',
  volume: 1,
  type: Audio.Type.Effect
};

const gameoverAudio = [
  GameoverAudio,
  GameoverAudio2,
  GameoverAudio3,
  GameoverAudio4,
  GameoverAudio5
];

export const preloadGameoverAudio = (scene: Phaser.Scene) => {
  preloadAudio(scene, GameoverAudio.key, GameoverAudio.url);
  preloadAudio(scene, GameoverAudio2.key, GameoverAudio2.url);
  preloadAudio(scene, GameoverAudio3.key, GameoverAudio3.url);
  preloadAudio(scene, GameoverAudio4.key, GameoverAudio4.url);
  preloadAudio(scene, GameoverAudio5.key, GameoverAudio5.url);
};

export const playGameoverAudio = (scene: Phaser.Scene) => {
  const randomAudio = gameoverAudio[Math.floor(Math.random() * gameoverAudio.length)];
  AudioService.playAudio(scene, randomAudio);
};