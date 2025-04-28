import { Enemy } from "../../core/types/enemyTypes";
import { EnemyEntity } from "../../core/entities/EnemyEntity";

export class RabbitEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, x: number, y: number, config: Enemy.Config) {
    super(scene, id, x, y, config);
  }
}