import { Enemy } from '../../core/types/enemyTypes';
import mouseWalkTextureUrl from './assets/mouse.atlas.png';
import jsonUrl from './assets/mouse.json';
import atlasUrl from './assets/mouse.atlas';

export const MouseConfig: Enemy.Config = {
  type: Enemy.Type.MOUSE,
  health: 47,
  scale: 0.1,
  offset: { x: 0, y: 12 },
  baunds: {
    body: { x: 0, y: 0, width: 30, height: 24 },
    head: { x: 0, y: 0, width: 15, height: 15 },
  },
  score: [
    { death: true, value: 50 },
  ],
  damageMultiplier: {},
  killCombo: [],
  spine: {
    key: Enemy.Type.MOUSE,
    atlas: atlasUrl,
    json: jsonUrl,
    texture: mouseWalkTextureUrl,
    timeScale: 2,
    animations: [
      Enemy.Animation.WALK,
      Enemy.Animation.WOUNDED,
      Enemy.Animation.DEATH,
    ],
  },
}
