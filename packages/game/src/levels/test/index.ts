import { WeaponType } from '../../weapons/WeaponTypes';
import { createWavesConfig } from './wavesConfig';

export const testLevel = {
  location: '',
  waves: createWavesConfig(),
  quests: [],
  weapons: [
    // {
    //   type: WeaponType.GLOCK,
    //   price: 0,
    // },
    {
      type: WeaponType.REVOLVER,
      price: 500,
    },
    {
      type: WeaponType.MP5,
      price: 1000,
    },
    {
      type: WeaponType.GRENADE,
      price: 1500,
    },
    {
      type: WeaponType.MINE,
      price: 2000,
    },
    {
      type: WeaponType.SAWED,
      price: 2500,
    },
    {
      type: WeaponType.LAUNCHER,
      price: 5000,
    },
    {
      type: WeaponType.M4,
      price: 6000,
    },
    {
      type: WeaponType.AWP,
      price: 7500,
    },
    {
      type: WeaponType.MACHINE,
      price: 12500,
    },
  ]
}
