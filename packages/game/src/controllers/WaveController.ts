import { StorageSpace, SyncCollection } from "@hunter/multiplayer/dist/client";
import { emitEvent } from "../GameEvents";
import { EnemyCollections, preloadEnemies } from "../enemies";
import { enemyStateCollection } from "../storage/collections/enemyState.collection";
import { Enemy, Game, Wave } from "../types";
import { generateId } from "../utils/stringGenerator";

export class WaveController {
  private currentWave: number = 0;
  private waitingForEnemies: boolean = false;
  private enemyCollection: SyncCollection<Enemy.State>;

  constructor(
    private scene: Phaser.Scene,
    private waves: Wave.Config[],
    private storage: StorageSpace
  ) {
    this.currentWave = 0;

    this.enemyCollection = this.storage.getCollection<Enemy.State>(enemyStateCollection)!;

    this.enemyCollection.subscribe('Remove', this.handleEnemyDeath.bind(this));
  }

  // private handleGameState(payload: Game.Events.State.Payload): void {
  //   // this.currentWave = payload.currentWave;
  // }

  public start(): void {
    this.nextWave(0);
  }

  private handleEnemyDeath(): void {
    if (this.waitingForEnemies && this.enemyCollection.getSize() === 0) {
      this.waveComplete(this.currentWave);
    }
  }

  static preloadEnemies(scene: Phaser.Scene, waves: Wave.Config[]) {
    const enemys = new Set<Enemy.Type>();
    waves.forEach(wave => {
      wave.spawns.forEach(spawn => {
        enemys.add(spawn.state.type as Enemy.Type);
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
      const enemyConfig = EnemyCollections[spawn.state.type as Enemy.Type].config;
      this.enemyCollection.addItem(generateId(), {
        type: spawn.state.type,
        x: spawn.state.x,
        y: spawn.state.y,
        vx: spawn.state.vx || 0,
        vy: spawn.state.vy || 0,
        health: spawn.state.health || enemyConfig.health,
        boss: spawn.state.boss || false,
        level: spawn.state.level || waveIndex + 1,
      })

      if (nextSpawn) {
        this.nextSpawn(waveIndex, spawnIndex + 1);
      } else {
        if (!wave.waitAllEnemiesDead || this.enemyCollection.getSize() === 0) {
          this.waveComplete(waveIndex);
        } else {
          this.waitingForEnemies = true;
        }
      }
    });
  }

  private end() {

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

  public destroy(): void { }
}