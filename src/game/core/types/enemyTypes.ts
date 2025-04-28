import { WeaponType } from "../../weapons/WeaponTypes";
import { ShadowEntityOptions } from "../entities/ShadowEntity";

export namespace Enemy {
  export enum Type {
    RABBIT = 'rabbit',
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

  export interface Config {
    health: number;
    debug?: boolean;
    shadow?: ShadowEntityOptions
    scale: number;

    offset: {
      x: number;
      y: number;
    }

    motion: {
      depthOffset?: number;
      acceleration: number;
      deceleration: number;
      maxVelocityX: number;
      maxVelocityY: number;
      friction: number;
      direction: number;
    }

    baunds: Bounds;

    damageMultiplier?: Partial<Record<Body, number>>;

    score: ScoreRule[];

    killCombo?: killCombo[];

    animations: Animation[];
  }

  interface ScoreRule {
    target: Body;
    weapon?: WeaponType;
    kill: boolean;
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

  interface killCombo {
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
