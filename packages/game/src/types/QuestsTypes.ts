import { Game, Bank } from "../types";
import { I18nReturnType } from "../utils/i18n";

export namespace Quest {

  export interface StorageState {
    lastCompletedQuestId: string | null;
  }

  export interface Config {
    id: string;
    tasks: AnyTaskConfig[];
  }

  export interface TaskState {
    done: boolean;
  }

  export interface BaseTaskConfig {
    id: string;
    reward: Reward;
    title: I18nReturnType<string>;
    event: string;
    valueKey?: string;
    value?: number;
    count: number;
  }

  export interface Reward {
    id?: string;
    currency: Bank.Currency;
    amount: number;
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

    export interface ProjectileType {
      key: Game.Events.Stat.Key.ProjectileType['key'];
      value: Game.Events.Stat.Key.ProjectileType['value'];
    }

    export interface Body {
      key: Game.Events.Stat.Key.Body['key'];
      value: Game.Events.Stat.Key.Body['value'];
    }

    export interface OneShot {
      key: Game.Events.Stat.Key.OneShotKill['key'];
      value: Game.Events.Stat.Key.OneShotKill['value'];
    }

    export interface Distance extends Condition.Numeric {
      key: Game.Events.Stat.Key.Distance['key'];
      value: Game.Events.Stat.Key.Distance['value'];
    }

    export interface Damage extends Condition.Numeric {
      key: Game.Events.Stat.Key.Damage['key'];
      value: Game.Events.Stat.Key.Damage['value'];
    }

    export interface Score extends Condition.Numeric {
      key: Game.Events.Stat.Key.Score['key'];
      value: Game.Events.Stat.Key.Score['value'];
    }

    export interface WaveNumber extends Condition.Numeric {
      key: Game.Events.Stat.Key.WaveNumber['key'];
      value: Game.Events.Stat.Key.WaveNumber['value'];
    }
  }

  export namespace Event {
    export interface Kill extends BaseTaskConfig {
      event: typeof Game.Events.Stat.EnemyKillEvent.Event;
      conditions: (Condition.WeaponName | Condition.EnemyType | Condition.Body | Condition.OneShot | Condition.Distance)[];
    }
    export interface Damage extends BaseTaskConfig {
      event: typeof Game.Events.Stat.EnemyDamageEvent.Event;
      valueKey: Game.Events.Stat.Key.Damage['key'];
      conditions: (Condition.WeaponName | Condition.EnemyType | Condition.Body | Condition.Damage )[];
    }
    export interface DubleKill extends BaseTaskConfig {
      event: typeof Game.Events.Stat.DubleKillEvent.Event;
      conditions: (Condition.WeaponName | Condition.ProjectileType)[];
    }
    export interface TripleKill extends BaseTaskConfig {
      event: typeof Game.Events.Stat.TripleKillEvent.Event;
      conditions: (Condition.WeaponName | Condition.ProjectileType)[];
    }
    export interface ComboKill extends BaseTaskConfig {
      event: typeof Game.Events.Stat.ComboKillEvent.Event;
      conditions: (Condition.EnemyType)[];
    }
    export interface PurchaseWeapon extends BaseTaskConfig {
      event: typeof Game.Events.Stat.PurchaseWeaponEvent.Event;
      conditions: (Condition.WeaponName)[];
    }
    export interface Earn extends BaseTaskConfig {
      event: typeof Game.Events.Stat.EarnEvent.Event;
      valueKey?: Game.Events.Stat.Key.Score['key'];
      conditions: (Condition.Score)[];
    }
    export interface Spend extends BaseTaskConfig {
      event: typeof Game.Events.Stat.SpendEvent.Event;
      valueKey?: Game.Events.Stat.Key.Score['key'];
      conditions: (Condition.Score)[];
    }
    export interface WaveComplete extends BaseTaskConfig {
      event: typeof Game.Events.Stat.WaveCompleteEvent.Event;
      valueKey?: Game.Events.Stat.Key.WaveNumber['key'];
      conditions: (Condition.WaveNumber)[];
    }
  }

  export type AnyTaskConfig = 
    Event.Kill | 
    Event.Damage | 
    Event.DubleKill | 
    Event.TripleKill |
    Event.ComboKill |
    Event.PurchaseWeapon |
    Event.Earn |
    Event.Spend |
    Event.WaveComplete;
}

// PlayTime 
// game