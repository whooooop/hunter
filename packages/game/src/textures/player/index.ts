import { preloadImage } from "../../preload";
import { ImageTexture } from "../../types/texture";

import PlayerBodyTextureUrl from './assets/body.png';
import PlayerHandTextureUrl from './assets/hand.png';
import PlayerLegLeftTextureUrl from './assets/legLeft.png';
import PlayerLegRightTextureUrl from './assets/legRight.png';

export const PlayerBodyTexture: ImageTexture = {
  key: 'player_body_texture',
  url: PlayerBodyTextureUrl,
  scale: 0.5,
}

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

export const preloadPlayerTextures = (scene: Phaser.Scene) => {
  preloadImage(scene, { key: PlayerBodyTexture.key, url: PlayerBodyTexture.url! });
  preloadImage(scene, { key: PlayerHandTexture.key, url: PlayerHandTexture.url! });
  preloadImage(scene, { key: PlayerLegLeftTexture.key, url: PlayerLegLeftTexture.url! });
  preloadImage(scene, { key: PlayerLegRightTexture.key, url: PlayerLegRightTexture.url! });
}