import { Enemy } from '../../core/types/enemyTypes';
import mouseWalkTextureUrl from './assets/image17.png';

export const MouseConfig: Enemy.Config = {
  type: Enemy.Type.MOUSE,
  debug: true,
  health: 47,
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
    body: { x: 0, y: 0, width: 42, height: 40 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  texture: {
    key: 'mouse_walk_0',
    url: mouseWalkTextureUrl,
  },
  animations: [],
}
