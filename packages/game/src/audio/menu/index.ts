import { preloadAudio } from '../../preload';
import menuMusicUrl from './assets/menu.mp3';

export const MenuAudio = {
  url: menuMusicUrl,
  key: 'menu_music'
};

export const preloadMenuAudio = (scene: Phaser.Scene) => {
  preloadAudio(scene, MenuAudio.key, MenuAudio.url);
};