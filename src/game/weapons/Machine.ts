import { WeaponType } from "./WeaponTypes";
import { ProjectileName } from "../projectiles/ProjectileName";
import { Weapon } from "../core/types/weaponTypes";
import { BaseEmptyAudio, BaseShootAudio } from "./assets/baseAudio";
// import MachineShootAudioUrl from './assets/audio/machine_shoot_0.mp3';
import MachineTextureUrl from './assets/textures/machine_texture_0.png';

export const MachineConfig: Weapon.Config = {
  name: WeaponType.MACHINE,
  texture: {
    key: 'machine_texture_0',
    url: MachineTextureUrl, 
    scale: 0.5,
    offset: {
      x: 20,
      y: 18,
    }
  },

  damage: 40,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  magazineSize: 200,    // Размер магазина

  firePointOffset: [0, -4],

   // Перезарядка
  reloadTime: 1200,    // Скорость перезарядки в мс
  boltTime: 600,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 60,       // Задержка между выстрелами в мс
  aimingTime: 2500,    // Время прицеливания в мс
  spreadAngle: 5,      // Угол разброса при выстреле в градусах
  automatic: true,

  // Параметры отдачи
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи

  sight: true,
  shellCasings: true,

  muzzleFlash: {
    scale: 1.5,
  },

  fireAudio: BaseShootAudio,
  emptyAudio: BaseEmptyAudio,

  projectile: ProjectileName.BULLET
}
