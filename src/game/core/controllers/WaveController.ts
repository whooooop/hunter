import { DamageableEntity } from "../entities/DamageableEntity";

export enum WaveEvents {
  spawnEnemy = 'spawnEnemy',
  waveStart = 'waveStart'
}

export interface waveStartEventPayload {
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
  entity: new (scene: Phaser.Scene, x: number, y: number, options: any) => DamageableEntity;
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

  private nextWave(waveIndex: number) {
    const wave = this.waves[waveIndex];

    if (wave) {
      const spawns = wave.spawns;
      const waveDuration = this.calculateWaweDuration(waveIndex);
  
      this.scene.time.delayedCall(wave.delay, () => {
        const startWaveEventPayload: waveStartEventPayload = {
          duration: waveDuration,
          number: waveIndex + 1
        }
        this.scene.events.emit(WaveEvents.waveStart, startWaveEventPayload);
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
      const enemy = new spawn.entity(this.scene, spawn.position[0], spawn.position[1], spawn.options);
      this.scene.events.emit(WaveEvents.spawnEnemy, enemy);

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