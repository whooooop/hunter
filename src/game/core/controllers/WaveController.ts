import { DamageableEntity } from "../entities/DamageableEntity";

export enum WaveEvents {
  spawnEnemy = 'spawnEnemy',
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
    const wave = this.waves[this.currentWave];
    this.scene.time.delayedCall(wave.delay, () => {
      wave.spawns.forEach(spawn => {
        const enemy = new spawn.entity(this.scene, spawn.position[0], spawn.position[1], spawn.options);
        this.scene.events.emit(WaveEvents.spawnEnemy, enemy);
      });
    });
  }

  public update(time: number, delta: number): void {
    if (this.currentWave < this.waves.length) {
      this.waves[this.currentWave].delay -= delta;
    }
  } 
  
}