import { WeaponSightType } from '../entities/SightEntity';
import { ProjectileName } from '../projectiles/ProjectileName';
import { AWPImageTexture_0 } from '../textures/AWPTexture';
import { Audio, Weapon, WeaponTexture } from "../types";
import { hexToNumber } from '../utils/colors';
import awpFireAudio from './assets/audio/awp_shoot_audio_0.mp3';
import { WeaponType } from './WeaponTypes';

const WeaponAWPTexture_0: WeaponTexture = {
  ...AWPImageTexture_0,
  offset: {
    x: 28,
    y: 20,
  }
}

export const AWPConfig: Weapon.Config = {
  name: WeaponType.AWP,
  texture: WeaponAWPTexture_0,
  reloadTime: 3000,      // Скорость перезарядки в мс
  magazineSize: 6,      // Размер магазина
  damage: 1000,         // Урон от одного выстрела
  speed: [8000, 4000],  // Скорость пули
  fireRate: 400,       // Задержка между выстрелами в мс
  boltTime: 1000,      // Задержка перед выстрелом в мс
  recoilForce: 30,      // Сила отдачи
  recoilRecovery: 5,    // Скорость восстановления от отдачи
  spreadAngle: 9,
  aimingTime: 1000,
  automatic: false,
  triggerRelease: true,
  hideSightWhenCantFire: true,
  sight: {
    type: WeaponSightType.RAY,
    color: hexToNumber('#ff0000'),
    alpha: 0.8,
    range: 98,
    lineThickness: 1
  },
  fireAudio: {
    key: 'awp_fire_audio_0',
    url: awpFireAudio,
    type: Audio.Type.Effect,
    volume: 1,
  },
  muzzleFlash: {
    scale: 1,
  },
  shellCasings: true,
  firePointOffset: [0, -3],
  projectile: ProjectileName.BULLET
}
