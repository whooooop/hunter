import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/deerBaby.atlas';
import deerBabyWalkTextureUrl from './assets/deerBaby.atlas.png';
import jsonUrl from './assets/deerBaby.json';

export const DeerBabyConfig: Enemy.Config = {
  type: Enemy.Type.DEER_BABY,
  health: 150,
  scale: 0.1,
  offset: { x: 3, y: 29 },
  baunds: {
    body: { x: 0, y: 0, width: 40, height: 42 },
    head: { x: 0, y: 0, width: 20, height: 20 },
  },
  score: [
    { death: true, value: 60 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.DEER_BABY,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: deerBabyWalkTextureUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 1
      },
      [Enemy.Animation.WOUNDED]: {
        timeScale: 1
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 1
      },
      [Enemy.Animation.DEATH_HEAD]: {
        timeScale: 1
      },
    },
  },
}
