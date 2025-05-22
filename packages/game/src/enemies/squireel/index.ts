import { EnemyEntity } from "../../entities/EnemyEntity";
import { SquireelConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class SquireelEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, SquireelConfig, spawnConfig);
  }
}