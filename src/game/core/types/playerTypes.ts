import { WeaponType } from "../../weapons/WeaponTypes";
import { EventPlayerJoined } from "../proto/generated/game";
import { EventPlayerPosition } from "../proto/generated/game";

export namespace Player {
  export interface StorageState {
    id: string;
  }

  export namespace Events { 

    export namespace Join {
      export const Remote = 'PlayerJoinRemoteEvent';
      export type Payload = EventPlayerJoined;
    }

    export namespace Left {
      export const Remote = 'PlayerLeftRemoteEvent';
      export interface Payload {
        playerId: string;
      }
    }

    export namespace ChangeWeapon {
      export const Local = 'PlayerChangeWeaponEvent';
      export interface Payload {
        playerId: string;
        direction: 1 | -1;
      }
    }

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
        movement: { x: number, y: number };
        position: { x: number, y: number };
      }
    }
  }
}
