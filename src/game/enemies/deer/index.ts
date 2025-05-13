import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { DeerConfig } from "./config";
import { Enemy } from "../../core/types/enemyTypes";

export class DeerEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, DeerConfig, spawnConfig);

    scene.time.delayedCall(4000, () => {
      this.setAnimation(Enemy.Animation.RUN);
      let startVelocityYSign = Math.sign(spawnConfig?.velocityY || 1);
      this.motionController.setMove(-6, -0.2 * startVelocityYSign);
    });
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
  }
}