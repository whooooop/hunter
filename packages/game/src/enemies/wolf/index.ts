import { EnemyEntity } from "../../entities/EnemyEntity";
import { WolfConfig } from "./config";
import { Enemy } from "../../types/enemyTypes";

export class WolfEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, WolfConfig, spawnConfig);
  }
}