import { StorageSpace, SyncCollection } from "@hunter/multiplayer/dist/client";
import { EmbienceEvent, WaveState } from "@hunter/storage-proto/dist/storage";
import { emitEvent } from "../GameEvents";
import { EnemyCollections, preloadEnemies } from "../enemies";
import { enemyStateCollection } from "../storage/collections/enemyState.collection";
import { embienceEvent } from "../storage/collections/events.collectio";
import { waveStateCollection } from "../storage/collections/waveState.collection";
import { Enemy, Game, Wave } from "../types";
import { generateId } from "../utils/stringGenerator";

export class WaveController {
  private waitingForEnemies: boolean = false;
  private enemyCollection: SyncCollection<Enemy.State>;
  private waveCollection: SyncCollection<WaveState>;
  private waveState!: WaveState;
  private active: boolean = false;

  private bossCount: number = 0;
  private aliveCount: number = 0;
  private bossMaxHp: number = 0;

  constructor(
    private scene: Phaser.Scene,
    private waves: Wave.Config[],
    private storage: StorageSpace,
  ) {
    this.enemyCollection = this.storage.getCollection<Enemy.State>(enemyStateCollection)!;
    this.waveCollection = this.storage.getCollection<WaveState>(waveStateCollection)!;
    this.enemyCollection.subscribe('Remove', this.handleEnemyDeath.bind(this));
    this.enemyCollection.subscribe('Update', this.handleEnemyUpdate.bind(this));
  }

  public stop() {
    this.active = false;
  }

  public start(): void {
    if (this.active) {
      return;
    }

    const waveState = this.waveCollection.getItem('wave');

    if (waveState) {
      this.waveState = waveState;
    } else {
      this.storage.getCollection<WaveState>(waveStateCollection)!.updateItem('wave', { waveIndex: 0, spawnIndex: 0, progress: 0, boss: false });
      this.waveState = this.storage.getCollection<WaveState>(waveStateCollection)!.getItem('wave')!;
    }

    this.active = true;
    this.runWave();
  }

  private handleEnemyDeath(): void {
    if (!this.active) {
      return;
    }


    this.calculateEnemyCount();

    if (this.waitingForEnemies && this.aliveCount === 0) {
      this.waveCompleted();
    }
  }

  private handleEnemyUpdate(): void {
    if (!this.active) {
      return;
    }

    this.calculateEnemyCount();

    if (this.bossCount > 0) {
      const currentHp = this.enemyCollection.getItems().filter(enemy => enemy.boss).reduce((acc, enemy) => acc + enemy.health, 0);
      this.waveState.progress = Math.max(0, Math.min(100, Math.ceil(currentHp / this.bossMaxHp * 100)));
    }
  }

  private calculateEnemyCount(): void {
    this.bossCount = this.enemyCollection.getItems().filter(enemy => enemy.boss && enemy.health > 0).length;
    this.aliveCount = this.enemyCollection.getItems().filter(enemy => enemy.health > 0).length;
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

  private runWave() {
    if (!this.active) {
      return;
    }

    const wave = this.waves[this.waveState.waveIndex];
    if (wave) {
      this.spawnEnemy();
    } else {
      this.end();
    }
  }

  private waveCompleted() {
    if (!this.active) {
      return;
    }

    this.waitingForEnemies = false;

    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.WaveCompleteEvent.Event,
      data: {
        waveNumber: this.waveState.waveIndex + 1
      }
    });

    const nextWave = this.waves[this.waveState.waveIndex + 1];
    if (nextWave) {
      this.waveState.waveIndex++;
      this.waveState.spawnIndex = 0;
      this.waveState.boss = false;
      this.waveState.progress = 0;
      this.bossMaxHp = 0;
      this.runWave();
    } else {
      this.end();
    }
  }

  private spawnEnemy() {
    if (!this.active) {
      return;
    }
    const waveIndex = this.waveState.waveIndex;
    const spawnIndex = this.waveState.spawnIndex;
    const wave = this.waves[waveIndex];
    const spawns = wave.spawns;
    const spawn = spawns[spawnIndex];

    if (!spawn) {
      this.enemySpawned();
      return;
    }

    if (spawn.ambience) {
      this.scene.time.delayedCall(spawn.ambience.delay || 0, () => {
        this.storage.getCollection<EmbienceEvent>(embienceEvent)!.addItem(generateId(), {
          assetKey: spawn.ambience!.assetKey,
        })
      });
    }

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
      const enemies = spawns.filter(spawn => !spawn.state.boss);
      if (spawn.state.boss) {
        this.waveState.boss = true;
        this.bossMaxHp += spawn.state.health || enemyConfig.health;
      }
      this.waveState.spawnIndex++;
      if (!this.waveState.boss && this.bossCount === 0) {
        this.waveState.progress = Math.max(0, Math.min(100, Math.ceil((this.waveState.spawnIndex + 1) / enemies.length * 100)));
      }
      this.enemySpawned();
    });
  }

  private enemySpawned() {
    const waveIndex = this.waveState.waveIndex;
    const spawnIndex = this.waveState.spawnIndex;
    const wave = this.waves[waveIndex];
    const spawns = wave.spawns;
    const spawn = spawns[spawnIndex];

    if (spawn) {
      this.spawnEnemy();
    } else {
      if (!wave.waitAllEnemiesDead || this.enemyCollection.getSize() === 0) {
        this.waveCompleted();
      } else {
        this.waitingForEnemies = true;
      }
    }
  }

  private end() {
    console.log('end');
  }

  public update(time: number, delta: number): void {

  }

  public destroy(): void { }
}