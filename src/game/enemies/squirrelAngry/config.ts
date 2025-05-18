import { Enemy } from '../../core/types/enemyTypes';
import squirrelAngryAtlasUrl from './assets/squirrelAngry.atlas.png';
import jsonUrl from './assets/squirrelAngry.json';
import atlasUrl from './assets/squirrelAngry.atlas';

export const SquirrelAngryConfig: Enemy.Config = {
  type: Enemy.Type.SQUIRREL_ANGRY,
  health: 47,
  scale: 0.1,
  offset: { x: 0, y: 20 },
  baunds: {
    body: { x: 0, y: 0, width: 30, height: 36 },
    head: { x: 0, y: 0, width: 15, height: 18 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.SQUIRREL_ANGRY,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: squirrelAngryAtlasUrl,
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
