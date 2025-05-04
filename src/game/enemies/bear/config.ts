import { Enemy } from '../../core/types/enemyTypes';
import bearWalkTextureUrl from './assets/image6.png';

export const BearConfig: Enemy.Config = {
  type: Enemy.Type.BEAR,
  health: 1200,
  scale: 1,
  motion: {
    acceleration: 20,
    deceleration: 8,
    maxVelocityX: 40,
    maxVelocityY: 2,
    direction: -1,
    friction: 0,
  },
  offset: { x: 0, y: 0 },
  baunds: {
    body: { x: 0, y: 0, width: 130, height: 110 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  texture: {
    key: 'bear_walk_0',
    url: bearWalkTextureUrl,
  },
  animations: [],
}
