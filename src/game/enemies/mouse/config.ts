import { Enemy } from '../../core/types/enemyTypes';
import mouseWalkTextureUrl from './assets/image17.png';

export const MouseConfig: Enemy.Config = {
  type: Enemy.Type.MOUSE,
  health: 47,
  scale: 1,
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
