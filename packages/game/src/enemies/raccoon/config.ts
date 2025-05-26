import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/raccoon.atlas';
import jsonUrl from './assets/raccoon.json';
import textureUrl from './assets/raccoon.atlas.png';

export const RaccoonConfig: Enemy.Config = {
  type: Enemy.Type.RACCOON,
  health: 47,
  scale: 0.1,
  offset: { x: 0, y: 18 },
  baunds: {
    body: { x: 0, y: 0, width: 42, height: 40 },
    head: { x: 0, y: 7, width: 42, height: 18 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.RACCOON,
    atlas: atlasUrl,
    texture: textureUrl,
    json: jsonUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 1
      },
      [Enemy.Animation.WOUNDED]: {
        timeScale: 1
      },
      [Enemy.Animation.DEATH_HEAD]: {
        timeScale: 1
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 1
      },
    },
  },
}
