import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon, WeaponTexture } from "../core/types/weaponTypes";
import { GrenadeImageTexture_0 } from '../textures/GrenadeTexture';
import GrenadeThrowAudioUrl from './assets/audio/grenade_throw_audio_0.mp3';

const GrenadeTexture_0: WeaponTexture = {
  ...GrenadeImageTexture_0,
  offset: {
    x: 10,
    y: 20,
  }
}

export const GrenadeConfig: Weapon.Config = {
  name: WeaponType.GRENADE,
  texture: GrenadeTexture_0,
  reloadTime: 2000,     // Скорость перезарядки в мс
  magazineSize: 1,      // Размер магазина
  damage: 250,          // Урон от одного выстрела
  speed: [900, 100],    // Скорость пули
  fireRate: 500,        // Задержка между выстрелами в мс
  spreadAngle: 0,       // Угол разброса при выстреле в градусах
  aimingTime: 0,        // Время прицеливания в мс
  recoilForce: 0,       // Сила отдачи
  recoilRecovery: 0,    // Скорость восстановления от отдачи
  fireDelay: 800,     
  automatic: false,
  sight: true,
  shellCasings: false,
  autoreload: true,
  hideWhileReload: true,
  
  fireAudio: {
    key: 'granade_throw_audio_0',
    url: GrenadeThrowAudioUrl,
  },

  projectile: ProjectileName.GRENADE
}
