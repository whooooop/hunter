import { preloadImage } from '../../preload';
import { ImageTexture } from '../../types/texture';
import BulletTextureUrl from './assets/bullet.png';

export const BulletTexture: ImageTexture = {
  key: 'bullet_texture',
  url: BulletTextureUrl,
  scale: 0.5,
}

export const preloadBulletTextures = (scene: Phaser.Scene): void => {
  preloadImage(scene, { key: BulletTexture.key, url: BulletTexture.url! });
}