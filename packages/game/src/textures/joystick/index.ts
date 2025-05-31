import { preloadImage } from '../../preload';
import { ImageTexture } from '../../types/texture';
import JoystickBaseTextureUrl from './assets/joystick_base.png';
import JoystickThumbTextureUrl from './assets/joystick_thumb.png';

export const JoystickBaseTexture: ImageTexture = {
  key: 'joystick_base',
  url: JoystickBaseTextureUrl,
  scale: 0.33,
}

export const JoystickThumbTexture: ImageTexture = {
  key: 'joystick_thumb',
  url: JoystickThumbTextureUrl,
  scale: 0.33,
}

export const preloadJoystickTextures = (scene: Phaser.Scene): void => {
  preloadImage(scene, { key: JoystickBaseTexture.key, url: JoystickBaseTexture.url! });
  preloadImage(scene, { key: JoystickThumbTexture.key, url: JoystickThumbTexture.url! });
}