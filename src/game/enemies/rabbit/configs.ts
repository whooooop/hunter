import { EnemyEntityOptions } from '../../core/entities/EnemyEntity';
import { SpriteSheetConfig } from '../../utils/sprite';
import rabbitWalkTextureUrl from './assets/images/walking.png';
import rabbitDeathTextureUrl from './assets/images/death.png';

export const entityConfig: EnemyEntityOptions = {
  health: 47,
  acceleration: 10,
  deceleration: 8,
  maxVelocityX: 40,
  maxVelocityY: 2,
  direction: -1,
  friction: 0,
  score: {
    value: 50,
    headScore: 100,
  },
  shadow: {
    scale: [0.5, 0.2],
    offset: [-20, -10],
  },
  debug: false,
}

export const walkConfig: SpriteSheetConfig = {
  key: 'rabbit_walk_0',
  url: rabbitWalkTextureUrl,
  frameWidth: 100,
  frameHeight: 85,
  scale: 1,
  frameRate: 60,
  startFrame: 0,
  endFrame: 29,
  repeat: -1,
}

export const deathConfig: SpriteSheetConfig = {
  key: 'rabbit_death_0',
  url: rabbitDeathTextureUrl,
  frameWidth: 100,
  frameHeight: 85,
  scale: 1,
  frameRate: 80,
  startFrame: 0,
  endFrame: 38,
  repeat: 0,
}
