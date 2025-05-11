import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { RabbitConfig } from "./configs";
import { AntiAimBehavior } from "../../behaviors/AntiAimBehavior";
import { Enemy } from "../../core/types/enemyTypes";

export class RabbitEnemy extends EnemyEntity {
  private antiAimBehavior: AntiAimBehavior;
  
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, RabbitConfig, {
      health: spawnConfig.health || RabbitConfig.health,
    });

    this.antiAimBehavior = new AntiAimBehavior(scene, this);
    
    if (spawnConfig.velocityX || spawnConfig.velocityY) {
      this.motionController.setMove(spawnConfig.velocityX || 0, spawnConfig.velocityY || 0);
    }

    // setTimeout(() => {
    //   this.motionController.setMove(-4, 0);
    // }, 5000);
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
    // this.antiAimBehavior.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
    this.antiAimBehavior.destroy();
  }
}