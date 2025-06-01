import { preloadImage } from "../../preload";
import { ImageTexture } from "../../types/texture";

import CoinsTextureUrl from './assets/coins.png';

export const CoinsTexture: ImageTexture = {
  key: 'coins_texture',
  url: CoinsTextureUrl,
  scale: 0.5,
}

export const preloadCoinsTextures = (scene: Phaser.Scene) => {
  preloadImage(scene, { key: CoinsTexture.key, url: CoinsTexture.url! });
}