import { WeaponType } from '../../weapons/WeaponTypes';
import { createWavesConfig } from './wavesConfig';

export const testLevel = {
  location: '',
  waves: createWavesConfig(),
  weapons: [
    {
      type: WeaponType.GLOCK,
      price: 0,
    },
    {
      type: WeaponType.REVOLVER,
      price: 100,
    },
    {
      type: WeaponType.MP5,
      price: 100,
    },
    {
      type: WeaponType.M4,
      price: 100,
    },
    {
      type: WeaponType.SAWED,
      price: 100,
    },
    {
      type: WeaponType.LAUNCHER,
      price: 100,
    },
    {
      type: WeaponType.AWP,
      price: 200,
    },
    {
      type: WeaponType.GRENADE,
      price: 200,
    },
    {
      type: WeaponType.MINE,
      price: 300,
    },
    {
      type: WeaponType.MACHINE,
      price: 300,
    },
  ]
}
