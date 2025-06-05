import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/mouse.atlas';
import mouseWalkTextureUrl from './assets/mouse.atlas.png';
import jsonUrl from './assets/mouse.json';

export const MouseConfig: Enemy.Config = {
  type: Enemy.Type.MOUSE,
  health: 70,
  scale: 0.1,
  offset: { x: 0, y: 12 },
  baunds: {
    body: { x: 0, y: 0, width: 30, height: 24 },
    head: { x: 0, y: 0, width: 15, height: 15 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.MOUSE,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: mouseWalkTextureUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 2
      },
      [Enemy.Animation.WOUNDED]: {
        timeScale: 2
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 2
      },
    },
  },
}
