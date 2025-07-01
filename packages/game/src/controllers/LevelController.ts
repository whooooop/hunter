import { StorageSpace } from '@hunter/multiplayer';
import { GameState } from '@hunter/storage-proto/src/storage';
import { playDangerSound } from '../audio/danger';
import { GAMEOVER } from '../config';
import { EnemyEntity } from "../entities/EnemyEntity";
import { GameplayScene } from "../scenes/Gameplay";
import { gameStateCollection } from '../storage/collections/gameState.collection';

export class LevelController {
  private dangerNotification = new Set<string>();

  constructor(
    private readonly scene: GameplayScene,
    private readonly storage: StorageSpace,
    private readonly enemies: Map<string, EnemyEntity>
  ) {
  }

  destroy(): void {
    this.dangerNotification.clear();
  }

  update(time: number, delta: number): void {
    const gameState = this.storage.getCollection<GameState>(gameStateCollection)!.getItem('game')!;

    if (!gameState || gameState.finished) {
      return;
    }

    this.enemies.forEach((enemy: EnemyEntity) => {
      const position = enemy.getPosition();
      if (position?.x < 0) {
        this.scene.destroyEnemy(enemy.id);
        if (GAMEOVER) {
          this.scene.gameOver();
        }
      } else if (position?.x < 250) {
        if (!this.dangerNotification.has(enemy.id)) {
          this.dangerNotification.add(enemy.id);
          playDangerSound(this.scene);
        }
      }
    });
  }

  async start(): Promise<void> {
    await this.scene.countdownStart(1000, 3000);
    this.scene.waveStart();
  }

  resumeWithAds(): void {
    this.enemies.forEach((enemy: EnemyEntity) => {
      if (enemy.getPosition()?.x < 400) {
        this.scene.destroyEnemy(enemy.id);
      }
    });
  }
}
