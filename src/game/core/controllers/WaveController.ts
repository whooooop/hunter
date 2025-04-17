import { createEnemy, EnemyType, preloadEnemies } from "../../enemies";
import { emitEvent } from "../Events";

export enum WaveEvents {
  WaveStartEvent = 'WaveStartEvent',
  SpawnEnemyEvent = 'SpawnEnemyEvent',
}

export interface WaveStartEventPayload {
  duration: number;
  number: number
}

export interface Wave {
  delay: number;
  spawns: Spawn[];
}

export interface Spawn {
  delay: number;
  position: [number, number];
  enemyType: EnemyType;
  options: any;
}

export class WaveController {
  private scene: Phaser.Scene;
  private waves: Wave[];
  private currentWave: number = 0;

  constructor(scene: Phaser.Scene, waves: Wave[]) {
    this.scene = scene;
    this.waves = waves;
    this.currentWave = 0;
  }

  public start(): void {
    this.nextWave(0);
  }

  static preloadEnemies(scene: Phaser.Scene, waves: Wave[]) {
    const enemys = new Set<EnemyType>();
    waves.forEach(wave => {
      wave.spawns.forEach(spawn => {
        enemys.add(spawn.enemyType);
      });
    });
    return preloadEnemies(scene, Array.from(enemys));
  }

  private nextWave(waveIndex: number) {
    const wave = this.waves[waveIndex];

    if (wave) {
      const waveDuration = this.calculateWaweDuration(waveIndex);
  
      this.scene.time.delayedCall(wave.delay, () => {
        const startWaveEventPayload: WaveStartEventPayload = {
          duration: waveDuration,
          number: waveIndex + 1 
        }
        emitEvent(this.scene, WaveEvents.WaveStartEvent, startWaveEventPayload);
        this.nextSpawn(waveIndex, 0);
      });
    } else {
      this.end();
    }
  }

  private nextSpawn(waveIndex: number, spawnIndex: number) {
    const wave = this.waves[waveIndex];
    const spawns = wave.spawns;
    const spawn = spawns[spawnIndex];
    const nextSpawn = spawns[spawnIndex + 1];

    this.scene.time.delayedCall(spawn.delay, () => {
      const enemy = createEnemy(spawn.enemyType, this.scene, spawn.position[0], spawn.position[1], spawn.options);
      emitEvent(this.scene, WaveEvents.SpawnEnemyEvent, enemy);

      if (nextSpawn) {
        this.nextSpawn(waveIndex, spawnIndex + 1);
      } else {
        this.nextWave(waveIndex + 1);
      }
    });
  }

  private end () {}

  private calculateWaweDuration(waveIndex: number): number {
    const wave = this.waves[waveIndex];
    let duration = 0;
    wave.spawns.forEach(spawn => {
      duration += spawn.delay;
    });
    return duration;
  }

  public update(time: number, delta: number): void {
    if (this.currentWave < this.waves.length) {
      this.waves[this.currentWave].delay -= delta;
    }
  } 
}