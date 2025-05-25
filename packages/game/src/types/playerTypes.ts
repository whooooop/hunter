import { PlayerState } from "@hunter/storage-proto/dist/storage";
// import { EventPlayerJoined } from "../proto/generated/game";
// import { EventPlayerPosition } from "../proto/generated/game";

export namespace Player {
  export interface StorageState {
    id: string;
  }

  export type State = PlayerState;

  export namespace Events {
    export namespace ChangeWeapon {
      export const Local = 'PlayerChangeWeaponEvent';
      export interface Payload {
        playerId: string;
        direction: 1 | -1;
      }
    }
  }
}
