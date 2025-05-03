import { Game } from "../types/gameTypes";

export namespace Quest {
  export interface Config {
    id: string;
    tasks: AnyTaskConfig[];
  }

  export interface BaseTaskConfig {
    id: string;
    reward: Reward;
    title: string;
    event: string;
    count: number;
  }

  export interface Reward {
    id?: string;
    type: RewardType;
    amount: number;
  }

  export enum RewardType {
    Star = 'star'
  }

  export namespace Condition {
    export interface Numeric {
      value: number;
      operator: '>' | '<' | '>=' | '<=' | '=';
    }

    export interface WeaponName {
      key: Game.Events.Stat.Key.WeaponName['key'];
      value: Game.Events.Stat.Key.WeaponName['value'];
    }

    export interface EnemyType {
      key: Game.Events.Stat.Key.EnemyType['key'];
      value: Game.Events.Stat.Key.EnemyType['value'];
    }

    export interface Body {
      key: Game.Events.Stat.Key.Body['key'];
      value: Game.Events.Stat.Key.Body['value'];
    }

    export interface OneShot {
      key: Game.Events.Stat.Key.OneShot['key'];
      value: Game.Events.Stat.Key.OneShot['value'];
    }

    export interface Distance extends Condition.Numeric {
      key: Game.Events.Stat.Key.Distance['key'];
      value: Game.Events.Stat.Key.Distance['value'];
    }

  }

  export namespace Event {
    export interface Kill extends BaseTaskConfig {
      event: Game.Events.Stat.KillEvent['event'];
      conditions: (Condition.WeaponName | Condition.EnemyType | Condition.Body | Condition.OneShot | Condition.Distance)[];
    }
    export interface Damage extends BaseTaskConfig {
      event: Game.Events.Stat.DamageEvent['event'];
      conditions: (Condition.WeaponName | Condition.Body)[];
    }
    // export interface DubleKill extends BaseTaskConfig {
    //   event: Game.Events.Stat.DubleKillEvent['event'];
    //   conditions: (Condition.WeaponName)[];
    // }
    // export interface TripleKill extends BaseTaskConfig {
    //   event: Game.Events.Stat.TripleKillEvent['event'];
    //   conditions: (Condition.WeaponName | Condition.EnemyType)[];
    // }
  }

  export type AnyTaskConfig = Event.Kill | Event.Damage;
}



// export enum id {
//   ComboKill = 'comboKill',
//   DubleKill = 'dubleKill',
//   TripleKill = 'tripleKill',
//   Jump = 'jump',
//   PlayTime = 'playTime',
//   Earn = 'earn',
//   Spend = 'spend',
// }