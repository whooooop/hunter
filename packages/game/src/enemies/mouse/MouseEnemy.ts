import { EnemyEntity } from "../../entities/EnemyEntity";
import { MouseConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class MouseEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, MouseConfig);

    if (spawnConfig.velocityX || spawnConfig.velocityY) {
      this.motionController.setMove(spawnConfig.velocityX || 0, spawnConfig.velocityY || 0);
    }
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}