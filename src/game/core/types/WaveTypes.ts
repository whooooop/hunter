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

    export namespace Spawn {
      export const Local = 'waveSpawnLocalEvent';
      export type Payload = {
        id: string;
        enemyType: Enemy.Type;
        spawnConfig: Enemy.SpawnConfig;
      };
    }

  }

  export interface Config {
    waitAllEnemiesDead: boolean;
    spawns: Spawn[];
  }

  export interface Spawn {
    delay: number;
    enemyType: Enemy.Type;
    spawnConfig: Enemy.SpawnConfig;
  }
}
