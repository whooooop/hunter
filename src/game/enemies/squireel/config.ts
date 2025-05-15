import { Enemy } from '../../core/types/enemyTypes';
import squireelWalkTextureUrl from './assets/squireel.atlas.png';
import jsonUrl from './assets/squireel.json';
import atlasUrl from './assets/squireel.atlas';

export const SquireelConfig: Enemy.Config = {
  type: Enemy.Type.SQUIREEL,
  health: 47,
  scale: 0.1,
  offset: { x: 0, y: 20 },
  baunds: {
    body: { x: 0, y: 0, width: 30, height: 40 },
    head: { x: 0, y: 4, width: 15, height: 18 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.SQUIREEL,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: squireelWalkTextureUrl,
    timeScale: 2,
    animations: [
      Enemy.Animation.WALK,
      Enemy.Animation.WOUNDED,
      Enemy.Animation.DEATH,
      Enemy.Animation.DEATH_HEAD,
    ],
  },
}
