import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/hedgehog.atlas';
import textureUrl from './assets/hedgehog.atlas.png';
import jsonUrl from './assets/hedgehog.json';

export const HedgehogConfig: Enemy.Config = {
  type: Enemy.Type.HEDGEHOG,
  health: 90,
  scale: 0.1,
  offset: { x: 0, y: 18 },
  baunds: {
    body: { x: 0, y: 0, width: 42, height: 40 },
    head: { x: 0, y: 18, width: 42, height: 12 },
  },
  score: [
    { death: true, value: 90 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.HEDGEHOG,
    atlas: atlasUrl,
    texture: textureUrl,
    json: jsonUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 5
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 3
      },
      [Enemy.Animation.RUN]: {
        timeScale: 3
      },
    },
  },
}
