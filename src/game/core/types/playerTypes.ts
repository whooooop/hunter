import { WeaponType } from "../../weapons/WeaponTypes";

export namespace Player {
  export namespace Events { 
    export namespace SetWeapon {
      export const Local = 'PlayerSetWeaponEvent';
      export const Remote = 'PlayerSetWeaponRemoteEvent';
      export interface Payload {
        weaponId: string;
        playerId: string;
        weaponType: WeaponType;
      }
    }

    export namespace State {
      export const Local = 'PlayerStateEvent';
      export const Remote = 'PlayerStateRemoteEvent';
      export interface Payload {
        playerId: string;
        position: { x: number, y: number };
      }
    }
  }
}
