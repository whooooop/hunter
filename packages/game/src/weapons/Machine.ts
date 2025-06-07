import { ProjectileName } from "../projectiles/ProjectileName";
import { Audio, Weapon } from "../types";
import MachineShootAudioUrl from './assets/audio/machine_shoot_0.mp3';
import { BaseEmptyAudio } from "./assets/baseAudio";
import MachineTextureUrl from './assets/textures/machine_texture_0.png';
import { WeaponType } from "./WeaponTypes";

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

  damage: 50,          // Урон от одного выстрела
  speed: [4000, 4000], // Скорость пули
  magazineSize: 160,    // Размер магазина

  firePointOffset: [0, -4],

  // Перезарядка
  reloadTime: 2500,    // Скорость перезарядки в мс
  boltTime: 800,          // Время взвода затвора

  // Параметры стрельбы
  fireRate: 100,       // Задержка между выстрелами в мс
  aimingTime: 200,    // Время прицеливания в мс
  spreadAngle: 2,      // Угол разброса при выстреле в градусах
  automatic: true,

  // Параметры отдачи
  recoilForce: 1,      // Сила отдачи
  recoilRecovery: 5,   // Скорость восстановления от отдачи

  sight: true,
  shellCasings: true,

  muzzleFlash: {
    scale: 1.5,
  },

  fireAudio: {
    key: WeaponType.MACHINE + '_shoot_0',
    url: MachineShootAudioUrl,
    type: Audio.Type.Effect,
    volume: 0.7,
  },
  emptyAudio: BaseEmptyAudio,

  projectile: ProjectileName.BULLET
}
