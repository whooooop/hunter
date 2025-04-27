import { ScoreKill } from "../../../types/score";
import { SpriteSheetConfig } from "../../utils/sprite";
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

  export interface Config {
    health: number;
    score: ScoreKill;
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

    body: {
      main: Body;
      head?: Body;
    }

    animations: {
      walk: SpriteSheetConfig;
      death?: SpriteSheetConfig;
    }
  }

  export interface Body {
    x: number;
    y: number;
    width: number;
    height: number;
    damageMultiplier?: number;
  }
}
