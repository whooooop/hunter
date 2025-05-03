import { generateId } from "../../../utils/stringGenerator";
import { Enemy } from "../types/enemyTypes";
import { emitEvent, offEvent, onEvent } from "../Events";
import { Game } from "../types/gameTypes";
import { preloadEnemies } from "../../enemies";
import { Wave } from "../types/WaveTypes";


export class WaveController {
  private scene: Phaser.Scene;
  private waves: Wave.Config[];
  private currentWave: number = 0;
  private spawnedEnemies: number = 0;
  private waitingForEnemies: boolean = false;
  
  constructor(scene: Phaser.Scene, waves: Wave.Config[]) {
    this.scene = scene;
    this.waves = waves;
    this.currentWave = 0;
    this.spawnedEnemies = 0;

    onEvent(scene, Game.Events.State.Remote, this.handleGameState, this);
    onEvent(scene, Game.Events.Enemies.Local, this.handleEnemiesCount, this);
  }

  private handleGameState(payload: Game.Events.State.Payload): void {
    // this.currentWave = payload.currentWave;
  }

  public start(): void {
    this.nextWave(0);
  }

  private handleEnemiesCount({ count }: Game.Events.Enemies.Payload): void {
    this.spawnedEnemies = count;
    if (this.waitingForEnemies && this.spawnedEnemies === 0) {
      this.waveComplete(this.currentWave);
    }
  }

  static preloadEnemies(scene: Phaser.Scene, waves: Wave.Config[]) {
    const enemys = new Set<Enemy.Type>();
    waves.forEach(wave => {
      wave.spawns.forEach(spawn => {
        enemys.add(spawn.enemyType);
      });
    });
    return preloadEnemies(scene, Array.from(enemys));
  }

  private nextWave(waveIndex: number) {
    const wave = this.waves[waveIndex];
    this.currentWave = waveIndex;

    if (wave) {
      const waveDuration = this.calculateWaweDuration(waveIndex);
  
      emitEvent(this.scene, Wave.Events.WaveStart.Local, {
        number: waveIndex + 1,
        duration: waveDuration
      });
      this.nextSpawn(waveIndex, 0);
    } else {
      this.end();
    }
  }

  private waveComplete(waveIndex: number) {
    this.waitingForEnemies = false;

    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      data: {
        waveNumber: waveIndex + 1 
      }
    });

    const nextWave = this.waves[waveIndex + 1];
    if (nextWave) {
      this.nextWave(waveIndex + 1);
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
      emitEvent(this.scene, Wave.Events.Spawn.Local, {
        id: generateId(),
        enemyType: spawn.enemyType,
        position: { x: spawn.position[0], y: spawn.position[1] },
        options: spawn.options
      });

      if (nextSpawn) {
        this.nextSpawn(waveIndex, spawnIndex + 1);
      } else {
        if (!wave.waitAllEnemiesDead || this.spawnedEnemies === 0) {
          this.waveComplete(waveIndex);
        } else {
          this.waitingForEnemies = true;
        }
      }
    });
  }

  private end () {
    
  }

  private calculateWaweDuration(waveIndex: number): number {
    const wave = this.waves[waveIndex];
    let duration = 0;
    wave.spawns.forEach(spawn => {
      duration += spawn.delay;
    });
    return duration;
  }

  public update(time: number, delta: number): void {
   
  } 

  public destroy(): void {
    offEvent(this.scene, Game.Events.State.Remote, this.handleGameState, this);
    offEvent(this.scene, Game.Events.Enemies.Local, this.handleEnemiesCount, this);
  }
}