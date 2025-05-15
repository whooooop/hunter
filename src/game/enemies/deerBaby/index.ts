import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { DeerBabyConfig } from "./config";
import { Enemy } from "../../core/types/enemyTypes";

export class DeerBabyEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, DeerBabyConfig, spawnConfig);
  }
}