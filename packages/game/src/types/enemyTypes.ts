import { EnemyState } from "@hunter/storage-proto/dist/storage";
import { SpriteConfig } from "../utils/sprite";
import { WeaponType } from "../weapons/WeaponTypes";
import { Audio } from "./audioTypes";

export namespace Enemy {
  export enum Type {
    HARE = 'hare',
    MOUSE = 'mouse',
    BEAR = 'bear',
    CAPIBARA = 'capibara',
    HEDGEHOG = 'hedgehog',
    RACCOON = 'raccoon',
    DEER = 'deer',
    DEER_BABY = 'deerBaby',
    SQUIREEL = 'squireel',
    SQUIRREL_ANGRY = 'squirrelAngry',
    WOLF = 'wolf',
  }

  export type State = EnemyState;

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

    velocityX?: number;
    velocityY?: number;

    offset: {
      x: number;
      y: number;
    }

    motion?: Motion

    baunds: Bounds;

    damageMultiplier?: Partial<Record<Body, number>>;

    score: ScoreRule[];

    killCombo?: killCombo[];

    animations?: AnimationSprite[];

    texture?: SpriteConfig;

    anims?: Record<string, string>;

    spine?: {
      key: string;
      atlas: string;
      json: string;
      texture: string;
      animations: Partial<Record<Animation, SpineAnimation>>;
    };

    ambience?: Record<string, Audio.Asset>;
  }

  // export interface SpawnConfig {
  //   type: Type;
  //   x: number;
  //   y: number;
  //   level?: number;
  //   health?: number;
  //   vx?: number;
  //   vy?: number;
  //   boss?: boolean;
  // }

  interface SpineAnimation {
    timeScale: number;
  }

  interface ScoreRule {
    target?: Body;
    weapon?: WeaponType;
    death: -1 | boolean;
    value: number;
    maxPenCount?: number;
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

  export interface AnimationSprite {
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

  export enum Animation {
    WALK = 'Walk',
    DEATH = 'Death',
    WOUNDED = 'Wounded',
    DEATH_HEAD = 'DeathHead',
    RUN = 'Run',
  }

  export type AnimationName = 'walk' | 'death';
}
