import { ScoreKill } from "../../../types/score";
import { ShadowEntityOptions } from "../entities/ShadowEntity";

export enum EnemyEntityEvents {
  enemyDeath = 'enemyDeath',
}

export interface EnemyDeathPayload {
  id: string;
}

export interface EnemyEntityOptions {
  health: number;
  depthOffset?: number;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  friction: number;
  direction: number;
  score: ScoreKill;
  debug?: boolean;
  shadow?: ShadowEntityOptions
}