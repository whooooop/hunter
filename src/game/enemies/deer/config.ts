import { Enemy } from '../../core/types/enemyTypes';
import atlasUrl from './assets/deer.atlas';
import jsonUrl from './assets/deer.json';
import textureUrl from './assets/deer.atlas.png';

export const DeerConfig: Enemy.Config = {
  type: Enemy.Type.DEER,
  health: 47,
  scale: 0.1,
  offset: { x: 0, y: 18 },
  baunds: {
    body: { x: 0, y: 0, width: 42, height: 40 },
    head: { x: 0, y: 18, width: 42, height: 12 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.DEER,
    atlas: atlasUrl,
    texture: textureUrl,
    json: jsonUrl,
    timeScale: 1,
    animations: [
      Enemy.Animation.WALK, 
      Enemy.Animation.DEATH,
      Enemy.Animation.RUN,
    ],
  },
}
