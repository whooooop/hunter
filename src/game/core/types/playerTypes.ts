import { WeaponType } from "../../weapons/WeaponTypes";

export enum PlayerEvents {
  PlayerSetWeaponEvent = 'PlayerSetWeaponEvent',
}

export interface PlayerSetWeaponEventPayload {
  playerId: string;
  weaponType: WeaponType;
}