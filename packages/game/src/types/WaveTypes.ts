import { Enemy } from "./enemyTypes";

export namespace Wave {
  export namespace Events {
    export namespace WaveStart {
      export const Local = 'waveStartLocalEvent';
      export type Payload = {
        duration: number;
        number: number
      };
    }
  }

  export interface Config {
    waitAllEnemiesDead: boolean;
    spawns: Spawn[];
  }

  export interface Spawn {
    delay: number;
    state: Pick<Enemy.State, 'type' | 'x' | 'y'> & Partial<Enemy.State>;
  }
}
