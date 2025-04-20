import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from '../projectiles/ProjectileName';
import { Weapon } from '../core/types/weaponTypes';

import GlockFireAudioUrl from './assets/glock_fire_0.mp3';
import GlockEmptyAudioUrl from './assets/glock_empty_0.mp3';
import { GlockImageTexture_0 } from '../textures/GlockTexture';

export const GlockConfig: Weapon.Config = {
  name: WeaponType.GLOCK,
  texture: {
    ...GlockImageTexture_0,
    offset: {
      x: 15,
      y: 20,
    }
  },
  reloadTime: 400,     // Скорость перезарядки в мс
  magazineSize: 12,    // Размер магазина
  damage: 18,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  fireRate: 100,       // Задержка между выстрелами в мс
  spreadAngle: 30,     // Угол разброса при выстреле в градусах
  aimingTime: 250,     // Время прицеливания в мс
  canAim: true,
  recoilForce: 0,      // Сила отдачи
  recoilRecovery: 0,   // Скорость восстановления от отдачи
  automatic: false,    // Пистолет автоматический
  fireAudio: {
    key: WeaponType.GLOCK + '_fire_0',
    url: GlockFireAudioUrl,
  },
  emptyAudio: {
    key: WeaponType.GLOCK + '_empty_0',
    url: GlockEmptyAudioUrl,
  },
  sight: true,
  shellCasings: true,

  projectile: ProjectileName.BULLET
}
