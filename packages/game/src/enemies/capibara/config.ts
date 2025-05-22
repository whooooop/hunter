import { Enemy } from '../../types/enemyTypes';

import atlasUrl from './assets/capibara.atlas';
import jsonUrl from './assets/capibara.json';
import textureUrl from './assets/capibara.atlas.png';

export const CapibaraConfig: Enemy.Config = {
  type: Enemy.Type.CAPIBARA,
  health: 47,
  scale: .11,
  offset: { x: 6, y: 24 },
  baunds: {
    head: { x: 0, y: 0, width: 50, height: 20 },
    body: { x: 0, y: 0, width: 50, height: 46 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.CAPIBARA,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: textureUrl,
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
