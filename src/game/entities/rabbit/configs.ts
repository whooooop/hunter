import { EnemyEntityOptions } from '../../core/entities/EnemyEntity';
import { SpriteSheetConfig } from '../../utils/sprite';
import rabbitWalkTextureUrl from './assets/images/walking.png';
import rabbitDeathTextureUrl from './assets/images/death.png';

export const entityConfig: EnemyEntityOptions = {
  health: 100,
  acceleration: 10,
  deceleration: 8,
  maxVelocityX: 30,
  maxVelocityY: 2,
  direction: -1,
  friction: 0,
  score: {
    value: 100,
    headMultiplier: 2,
  },
  debug: false,
}

export const walkConfig: SpriteSheetConfig = {
  key: 'rabbit_walk_0',
  url: rabbitWalkTextureUrl,
  frameWidth: 100,
  frameHeight: 85,
  scale: 1,
  frameRate: 30,
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
  frameRate: 30,
  startFrame: 0,
  endFrame: 39,
  repeat: 0,
}
