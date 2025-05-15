import { Enemy } from '../../core/types/enemyTypes';
import deerBabyWalkTextureUrl from './assets/deerBaby.atlas.png';
import jsonUrl from './assets/deerBaby.json';
import atlasUrl from './assets/deerBaby.atlas';

export const DeerBabyConfig: Enemy.Config = {
  type: Enemy.Type.DEER_BABY,
  health: 47,
  scale: 0.1,
  offset: { x: 3, y: 29 },
  baunds: {
    body: { x: 0, y: 0, width: 40, height: 42 },
    head: { x: 0, y: 0, width: 20, height: 20 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.DEER_BABY,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: deerBabyWalkTextureUrl,
    timeScale: 1,
    animations: [
      Enemy.Animation.WALK,
      Enemy.Animation.WOUNDED,
      Enemy.Animation.DEATH,
      Enemy.Animation.DEATH_HEAD,
    ],
  },
}
