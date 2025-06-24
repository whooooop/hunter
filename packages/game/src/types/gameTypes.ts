// import { EventGameState } from "../proto/generated/game";
import { WeaponType } from "../weapons/WeaponTypes";
import { Enemy } from "./enemyTypes";
import { Projectile } from "./ProjectileTypes";

export namespace Game {
  export namespace Events {
    export namespace Pause {
      export const Local = 'GamePauseLocalEvent';
      export type Payload = {};
    }

    export namespace Replay {
      export const Local = 'GameReplayLocalEvent';
      export type Payload = {};
    }

    export namespace ResumeWithAds {
      export const Local = 'GameResumeWithAdsLocalEvent';
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

      export namespace Key {
        export type EnemyType = {
          key: 'enemyType';
          value: Enemy.Type
        };
        export type WeaponName = {
          key: 'weaponName';
          value: WeaponType;
        };
        export type ProjectileType = {
          key: 'projectileType';
          value: Projectile.Type;
        };
        export type Body = {
          key: 'body';
          value: Enemy.Body;
        };
        export type OneShotKill = {
          key: 'oneShotKill';
          value: boolean;
        };
        export type Distance = {
          key: 'distance';
          value: number;
        };
        export type Damage = {
          key: 'damage';
          value: number;
        };
        export type Score = {
          key: 'score';
          value: number;
        };
        export type WaveNumber = {
          key: 'waveNumber';
          value: number;
        };
      }

      export namespace EnemyKillEvent {
        export const Event = 'enemyKill';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.EnemyType['key'], Key.EnemyType['value']>
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.Body['key'], Key.Body['value']>
          & Record<Key.OneShotKill['key'], Key.OneShotKill['value']>
          & Record<Key.Distance['key'], Key.Distance['value']>;
        }
      }

      export namespace EnemyDamageEvent {
        export const Event = 'enemyDamage';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.EnemyType['key'], Key.EnemyType['value']>
          & Record<Key.Body['key'], Key.Body['value']>
          & Record<Key.Damage['key'], Key.Damage['value']>;
        }
      }

      export namespace DubleKillEvent {
        export const Event = 'dubleKill';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.ProjectileType['key'], Key.ProjectileType['value']>
        }
      }

      export namespace TripleKillEvent {
        export const Event = 'tripleKill';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
          & Record<Key.ProjectileType['key'], Key.ProjectileType['value']>
        }
      }

      export namespace ComboKillEvent {
        export const Event = 'comboKill';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.EnemyType['key'], Key.EnemyType['value']>
        }
      }

      export namespace PurchaseWeaponEvent {
        export const Event = 'purchaseWeapon';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.WeaponName['key'], Key.WeaponName['value']>
        }
      }

      export namespace EarnEvent {
        export const Event = 'earn';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.Score['key'], Key.Score['value']>
        }
      }

      export namespace SpendEvent {
        export const Event = 'spend';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.Score['key'], Key.Score['value']>
        }
      }

      export namespace WaveCompleteEvent {
        export const Event = 'waveComplete';
        export interface Payload {
          event: typeof Event;
          data: {}
          & Record<Key.WaveNumber['key'], Key.WaveNumber['value']>
        }
      }

      export type Payload =
        EnemyKillEvent.Payload |
        EnemyDamageEvent.Payload |
        DubleKillEvent.Payload |
        TripleKillEvent.Payload |
        ComboKillEvent.Payload |
        PurchaseWeaponEvent.Payload |
        EarnEvent.Payload |
        SpendEvent.Payload |
        WaveCompleteEvent.Payload;
    }
  }
}