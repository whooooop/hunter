import { Enemy } from '../../core/types/enemyTypes';
import { WeaponType } from '../../weapons/WeaponTypes';

import atlasUrl from './assets/rabbit.atlas';
import jsonUrl from './assets/rabbit.json';
import textureUrl from './assets/rabbit.atlas.png';

export const RabbitConfig: Enemy.Config = {
  type: Enemy.Type.RABBIT,
  health: 47,
  scale: 0.07,
  offset: { x: 0, y: 20 },
  baunds: {
    body: { x: 0, y: 0, width: 42, height: 40 },
    head: { x: 0, y: 0, width: 42, height: 16 },
  },
  score: [
    { target: 'head', death: false, weapon: WeaponType.GLOCK, value: 10 },
    { target: 'head', death: true, weapon: WeaponType.GLOCK, value: 60 },
    { target: 'head', death: -1, weapon: WeaponType.REVOLVER, value: 70 },
    { death: true, value: 50 },
  ],
  damageMultiplier: {
    head: 2,
  },
  killCombo: [
    { rules: [
      { target: 'head', weapon: WeaponType.GLOCK },
      { target: 'head', weapon: WeaponType.REVOLVER },
    ], value: 5 },
  ],
  spine: {
    key: Enemy.Type.RABBIT,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: textureUrl,
    animations: [
      Enemy.Animation.WALK, 
      Enemy.Animation.WOUNDED, 
      Enemy.Animation.DEATH_HEAD, 
      Enemy.Animation.DEATH
    ],
  },
}
