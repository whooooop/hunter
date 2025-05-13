import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { CapibaraConfig } from "./config";
import { Enemy } from "../../core/types/enemyTypes";

export class CapibaraEnemy extends EnemyEntity {
  
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, CapibaraConfig, spawnConfig);
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}