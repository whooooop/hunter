import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/bear.atlas';
import textureUrl from './assets/bear.atlas.png';
import jsonUrl from './assets/bear.url.json';

export const BearConfig: Enemy.Config = {
  type: Enemy.Type.BEAR,
  health: 5000,
  scale: 0.1,
  offset: { x: -5, y: 50 },
  baunds: {
    body: { x: 0, y: 0, width: 120, height: 90 },
    head: { x: 0, y: 0, width: 60, height: 50 },
  },
  score: [
    { death: true, value: 2000 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.BEAR,
    atlas: atlasUrl,
    texture: textureUrl,
    json: jsonUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 1
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 1
      },
      [Enemy.Animation.RUN]: {
        timeScale: 1
      },
    },
  },
}
