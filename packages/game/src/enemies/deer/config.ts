import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/deer.atlas';
import textureUrl from './assets/deer.atlas.png';
import jsonUrl from './assets/deer.url.json';

export const DeerConfig: Enemy.Config = {
  type: Enemy.Type.DEER,
  health: 1250,
  scale: 0.1,
  offset: { x: 0, y: 44 },
  baunds: {
    body: { x: 0, y: 0, width: 72, height: 86 },
    head: { x: 0, y: 0, width: 30, height: 20 },
  },
  score: [
    { death: true, value: 400 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.DEER,
    atlas: atlasUrl,
    texture: textureUrl,
    json: jsonUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 0.5
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 4
      },
      [Enemy.Animation.RUN]: {
        timeScale: 0.5
      },
    },
  },
}
