import { EnemyEntity } from "../../entities/EnemyEntity";
import { SquirrelAngryConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class SquirrelAngryEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, SquirrelAngryConfig, spawnConfig);
  }
}