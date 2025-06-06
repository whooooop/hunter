import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import menuMusicUrl from './assets/menu.mp3';
import menuMusicUrl2 from './assets/menu2.mp3';

export const MenuAudio = {
  url: menuMusicUrl,
  key: 'menu_music',
  type: Audio.Type.Music,
  volume: 1,
};

export const MenuAudio2 = {
  url: menuMusicUrl2,
  key: 'menu_music_2',
  type: Audio.Type.Music,
  volume: 1,
};

const playlist = [MenuAudio, MenuAudio2];

export const preloadMenuAudio = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, MenuAudio);
  AudioService.preloadAsset(scene, MenuAudio2);
};

export const playMenuAudio = (scene: Phaser.Scene) => {
  const randomIndex = Math.floor(Math.random() * playlist.length);
  AudioService.playAudio(scene, playlist[randomIndex].key);
};