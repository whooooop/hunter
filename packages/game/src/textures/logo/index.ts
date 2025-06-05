import { preloadImage } from "../../preload";
import { ImageTexture } from "../../types/texture";

import LogoTextureUrl from './assets/logo.png';

export const LogoTexture: ImageTexture = {
  key: 'logo_texture',
  url: LogoTextureUrl,
  scale: 0.4,
}

export const preloadLogoTextures = (scene: Phaser.Scene) => {
  preloadImage(scene, { key: LogoTexture.key, url: LogoTexture.url! });
}