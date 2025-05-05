import { SpriteConfig } from "../../utils/sprite";
import { WeaponType } from "../../weapons/WeaponTypes";

export namespace Enemy {
  export enum Type {
    RABBIT = 'rabbit',
    MOUSE = 'mouse',
    BEAR = 'bear',
  }

  export namespace Events {
    export namespace Death {
      export const Local = 'EnemyDeathLocalEvent';
      // export const Remote = 'EnemyDeathRemoteEvent';
      export interface Payload {
        id: string;
      }
    }
  }

  export type Body = 'head' | 'body' | 'eye';

  export interface Motion {
    depthOffset?: number;
    acceleration: number;
    deceleration: number;
    maxVelocityX: number;
    maxVelocityY: number;
    friction: number;
  }

  export interface Config {
    type: Type;
    health: number;
    debug?: boolean;
    scale: number;

    offset: {
      x: number;
      y: number;
    }

    motion?: Motion

    baunds: Bounds;

    damageMultiplier?: Partial<Record<Body, number>>;

    score: ScoreRule[];

    killCombo?: killCombo[];

    animations: Animation[];

    texture?: SpriteConfig;
  }

  export interface SpawnConfig {
    x: number;
    y: number;
    level?: number;
    health?: number;
    velocityX?: number;
    velocityY?: number;
  }

  interface ScoreRule {
    target?: Body;
    weapon?: WeaponType;
    death: -1 | boolean;
    value: number;
  }

  type Bounds = {
    body: Bound;
  } & Partial<Record<Exclude<Body, 'body'>, Bound>>;

  interface Bound {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface killCombo {
    rules: KillComboRule[];
    value: number;
  }

  interface KillComboRule {
    target: Body;
    weapon: WeaponType;
  }

  export interface Animation {
    name: AnimationName;
    key: string;
    url: string;
    frameWidth: number;
    frameHeight: number;
    frameRate: number;
    startFrame: number;
    endFrame: number;
    repeat: number;
  }

  export type AnimationName = 'walk' | 'death';
}
