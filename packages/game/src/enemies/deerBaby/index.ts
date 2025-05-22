import { EnemyEntity } from "../../entities/EnemyEntity";
import { DeerBabyConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class DeerBabyEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, DeerBabyConfig, spawnConfig);
  }
}