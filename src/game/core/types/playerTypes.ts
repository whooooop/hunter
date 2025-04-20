import { WeaponType } from "../../weapons/WeaponTypes";

export namespace Player {
  export namespace Events { 
    export namespace SetWeapon {
      export const Local = 'PlayerSetWeaponEvent';
      export const Remote = 'PlayerSetWeaponRemoteEvent';
      export interface Payload {
        playerId: string;
        weaponType: WeaponType;
      }
    }
  }
}
