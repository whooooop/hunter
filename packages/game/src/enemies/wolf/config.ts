import { WolfSound } from '../../audio/wolf';
import { Enemy } from '../../types/enemyTypes';
import atlasUrl from './assets/wolf.atlas';
import wolfAtlasUrl from './assets/wolf.atlas.png';
import jsonUrl from './assets/wolf.url.json';

console.log('jsonUrl', jsonUrl);

export const WolfConfig: Enemy.Config = {
  type: Enemy.Type.WOLF,
  health: 300,
  scale: 0.1,
  offset: { x: 0, y: 28 },
  baunds: {
    body: { x: 0, y: 0, width: 50, height: 50 },
    head: { x: 0, y: 0, width: 25, height: 25 },
  },
  score: [
    { death: true, value: 120 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.WOLF,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: wolfAtlasUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 1.2
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
  ambience: {
    spawn: WolfSound,
  }
}
