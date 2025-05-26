import { Enemy } from "./enemyTypes";

export namespace Wave {
  export interface Config {
    waitAllEnemiesDead: boolean;
    spawns: Spawn[];
  }

  export interface Spawn {
    delay: number;
    state: Pick<Enemy.State, 'type' | 'x' | 'y'> & Partial<Enemy.State>;
  }
}
