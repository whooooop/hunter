import { EnemyEntity } from "../../entities/EnemyEntity";
import { RaccoonConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class RaccoonEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, RaccoonConfig, spawnConfig);
  }
}