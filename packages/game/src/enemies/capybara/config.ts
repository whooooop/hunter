import { Enemy } from '../../types/enemyTypes';

import atlasUrl from './assets/CAPYBARA.atlas';
import textureUrl from './assets/CAPYBARA.atlas.png';
import jsonUrl from './assets/CAPYBARA.json';

export const CapybaraConfig: Enemy.Config = {
  type: Enemy.Type.CAPYBARA,
  health: 300,
  scale: .11,
  offset: { x: 6, y: 24 },
  baunds: {
    head: { x: 0, y: 0, width: 50, height: 20 },
    body: { x: 0, y: 0, width: 50, height: 46 },
  },
  score: [
    { death: true, value: 80 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.CAPYBARA,
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
