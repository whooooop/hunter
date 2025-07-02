import { Enemy } from "./index";

export namespace Wave {
  export interface Config {
    waitAllEnemiesDead: boolean;
    manualStart?: boolean;
    spawns: Spawn[];
  }

  export interface Spawn {
    delay: number;
    state: Pick<Enemy.State, 'type' | 'x' | 'y'> & Partial<Enemy.State>;
    ambience?: {
      delay?: number;
      assetKey: string;
    };
  }
}
