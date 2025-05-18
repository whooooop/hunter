import { Enemy } from '../../core/types/enemyTypes';
import squireelWalkTextureUrl from './assets/squireel.atlas.png';
import jsonUrl from './assets/squireel.json';
import atlasUrl from './assets/squireel.atlas';
import { WeaponType } from '../../weapons/WeaponTypes';

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
    { target: 'head', death: false, weapon: WeaponType.GLOCK, value: 10, maxPenCount: 0 },
    { target: 'head', death: true, weapon: WeaponType.GLOCK, value: 60 },
    { target: 'head', death: -1, weapon: WeaponType.REVOLVER, value: 70 },
    { death: true, value: 50 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [],
  spine: {
    key: Enemy.Type.SQUIREEL,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: squireelWalkTextureUrl,
    animations: {
      [Enemy.Animation.WALK]: {
        timeScale: 2
      },
      [Enemy.Animation.WOUNDED]: {
        timeScale: 2
      },
      [Enemy.Animation.DEATH]: {
        timeScale: 4
      },
      [Enemy.Animation.DEATH_HEAD]: {
        timeScale: 6
      },
    },
  },
}
