import { Enemy } from '../../core/types/enemyTypes';
import rabbitWalkTextureUrl from './assets/images/walking.png';
import rabbitDeathTextureUrl from './assets/images/death.png';

export const RabbitConfig: Enemy.Config = {
  health: 47,
  scale: 1,
  motion: {
    acceleration: 10,
    deceleration: 8,
    maxVelocityX: 40,
    maxVelocityY: 2,
    direction: -1,
    friction: 0,
  },
  offset: {
    x: 24,
    y: -10,
  },
  score: {
    value: 50,
    headScore: 100,
  },
  shadow: {
    scale: [0.5, 0.2],
    offset: [-20, -10],
  },
  body: {
    main: {
      x: 20,
      y: 0,
      width: 42,
      height: 40,
    },
    head: {
      x: 0,
      y: 0,
      width: 42,
      height: 16,
      damageMultiplier: 2,
    },
  },
  animations: [
    {
      name: 'walk',
      key: 'rabbit_walk_0',
      url: rabbitWalkTextureUrl,
      frameWidth: 100,
      frameHeight: 85,
      frameRate: 60,
      startFrame: 0,
      endFrame: 29,
      repeat: -1,
    },
    {
      name: 'death',
      key: 'rabbit_death_0',
      url: rabbitDeathTextureUrl,
      frameWidth: 100,
      frameHeight: 85,
      frameRate: 80,
      startFrame: 0,
      endFrame: 38,
      repeat: 0,
    }
  ],
  debug: false,
}
