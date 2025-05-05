import { Enemy } from '../../core/types/enemyTypes';
import { WeaponType } from '../../weapons/WeaponTypes';
import rabbitWalkTextureUrl from './assets/images/walking.png';
import rabbitDeathTextureUrl from './assets/images/death.png';

export const RabbitConfig: Enemy.Config = {
  type: Enemy.Type.RABBIT,
  health: 47,
  scale: 1,
  offset: { x: 24, y: -10 },
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
  animations: [
    {
      name: 'walk',
      key: 'rabbit_walk_0',
      url: rabbitWalkTextureUrl,
      frameWidth: 100,
      frameHeight: 85,
      frameRate: 60,
      startFrame: 0,
      endFrame: 29,
      repeat: -1,
    },
    {
      name: 'death',
      key: 'rabbit_death_0',
      url: rabbitDeathTextureUrl,
      frameWidth: 100,
      frameHeight: 85,
      frameRate: 80,
      startFrame: 0,
      endFrame: 38,
      repeat: 0,
    }
  ],
}
