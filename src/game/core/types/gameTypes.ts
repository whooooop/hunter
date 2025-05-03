import { EventGameState } from "../proto/generated/game";
import { Enemy } from "./enemyTypes";
import { WeaponType } from "../../weapons/WeaponTypes";

export namespace Game {
  export namespace Events {
    export namespace State {
      export const Remote = 'GameStateRemoteEvent';
      export type Payload = EventGameState;
    }

    export namespace Pause {
      export const Local = 'GamePauseLocalEvent';
      export type Payload = {};
    }

    export namespace Replay {
      export const Local = 'GameReplayLocalEvent';
      export type Payload = {};
    }

    export namespace Exit {
      export const Local = 'GameExitLocalEvent';
      export type Payload = {};
    }

    export namespace Resume {
      export const Local = 'GameResumeLocalEvent';
      export type Payload = {};
    }

    export namespace Stat {
      export const Local = 'GameStatLocalEvent';
      export type Payload = KillEvent;

      export namespace Key {
        export type EnemyType = {
          key: 'enemyType';
          value: Enemy.Type
        };
        export type WeaponName = {
          key: 'weaponName';
          value: WeaponType;
        };
        export type Body = {
          key: 'body';
          value: Enemy.Body;
        };
        export type OneShot = {
          key: 'oneShot';
          value: boolean;
        };
        export type Distance = {
          key: 'distance';
          value: number;
        };
      }

      export interface KillEvent {
        event: 'kill';
        data: {} 
          & Record<Key.EnemyType['key'], Key.EnemyType['value']> 
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.Body['key'], Key.Body['value']> 
          & Record<Key.OneShot['key'], Key.OneShot['value']> 
          & Record<Key.Distance['key'], Key.Distance['value']>;
      }

      export interface DamageEvent {
        event: 'damage';
        data: {} 
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.Body['key'], Key.Body['value']>
      }
    }
  }
}