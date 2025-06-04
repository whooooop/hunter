import { preloadImage } from "../../preload";
import { ImageTexture } from "../../types/texture";

import PlayerHandTextureUrl from './assets/hand.png';
import PlayerLegLeftTextureUrl from './assets/legLeft.png';
import PlayerLegRightTextureUrl from './assets/legRight.png';

import PlayerBodyTextureUrl from './assets/body1.png';
import PlayerBody2TextureUrl from './assets/body2.png';
import PlayerBody3TextureUrl from './assets/body3.png';
import PlayerBody4TextureUrl from './assets/body4.png';
import PlayerBody5TextureUrl from './assets/body5.png';
import PlayerBody6TextureUrl from './assets/body6.png';

export const PlayerHandTexture: ImageTexture = {
  key: 'player_hand_texture',
  url: PlayerHandTextureUrl,
  scale: 0.5,
}

export const PlayerLegLeftTexture: ImageTexture = {
  key: 'player_leg_left_texture',
  url: PlayerLegLeftTextureUrl,
  scale: 0.5,
}

export const PlayerLegRightTexture: ImageTexture = {
  key: 'player_leg_right_texture',
  url: PlayerLegRightTextureUrl,
  scale: 0.5,
}

export const PlayerBodyTexture: ImageTexture = {
  key: 'player_body_texture',
  url: PlayerBodyTextureUrl,
  scale: 0.25,
}

export const PlayerBody2Texture: ImageTexture = {
  key: 'player_body2_texture',
  url: PlayerBody2TextureUrl,
  scale: 0.25,
}

export const PlayerBody3Texture: ImageTexture = {
  key: 'player_body3_texture',
  url: PlayerBody3TextureUrl,
  scale: 0.25,
}

export const PlayerBody4Texture: ImageTexture = {
  key: 'player_body4_texture',
  url: PlayerBody4TextureUrl,
  scale: 0.25,
}

export const PlayerBody5Texture: ImageTexture = {
  key: 'player_body5_texture',
  url: PlayerBody5TextureUrl,
  scale: 0.25,
}

export const PlayerBody6Texture: ImageTexture = {
  key: 'player_body6_texture',
  url: PlayerBody6TextureUrl,
  scale: 0.25,
}

export const preloadPlayerTextures = (scene: Phaser.Scene) => {
  preloadImage(scene, { key: PlayerBodyTexture.key, url: PlayerBodyTexture.url! });
  preloadImage(scene, { key: PlayerBody2Texture.key, url: PlayerBody2Texture.url! });
  preloadImage(scene, { key: PlayerBody3Texture.key, url: PlayerBody3Texture.url! });
  preloadImage(scene, { key: PlayerBody4Texture.key, url: PlayerBody4Texture.url! });
  preloadImage(scene, { key: PlayerBody5Texture.key, url: PlayerBody5Texture.url! });
  preloadImage(scene, { key: PlayerBody6Texture.key, url: PlayerBody6Texture.url! });

  preloadImage(scene, { key: PlayerHandTexture.key, url: PlayerHandTexture.url! });
  preloadImage(scene, { key: PlayerLegLeftTexture.key, url: PlayerLegLeftTexture.url! });
  preloadImage(scene, { key: PlayerLegRightTexture.key, url: PlayerLegRightTexture.url! });
}

export const PlayerSkins = {
  body: {
    b1: PlayerBodyTexture,
    b2: PlayerBody2Texture,
    b3: PlayerBody3Texture,
    b4: PlayerBody4Texture,
    b5: PlayerBody5Texture,
    b6: PlayerBody6Texture,
  }
}