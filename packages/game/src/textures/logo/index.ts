import { getDefaultLocale } from "../../utils/i18n";

import { preloadImage } from "../../preload";
import { ImageTexture } from "../../types/texture";

import LogoTextureUrl from './assets/logo.png';
import LogoTextureUrl_ru from './assets/logo_ru.png';

export const LogoTexture: ImageTexture = {
  key: 'logo_texture',
  url: LogoTextureUrl,
  scale: 0.4,
}
export const LogoTexture_ru: ImageTexture = {
  key: 'logo_ru_texture',
  url: LogoTextureUrl_ru,
  scale: 0.4,
}

export const preloadLogoTextures = (scene: Phaser.Scene) => {
  const locale = getDefaultLocale();
  if (locale === 'ru') {
    preloadImage(scene, { key: LogoTexture_ru.key, url: LogoTexture_ru.url! });
  } else {
    preloadImage(scene, { key: LogoTexture.key, url: LogoTexture.url! });
  }
}

export const getLogoTexture = () => {
  const locale = getDefaultLocale();
  if (locale === 'ru') {
    return LogoTexture_ru;
  }
  return LogoTexture;
}