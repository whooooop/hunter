import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { HedgehogConfig } from "./config";
import { Enemy } from "../../core/types/enemyTypes";

export class HedgehogEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) {
    super(scene, id, spawnConfig.x, spawnConfig.y, HedgehogConfig, spawnConfig);

    scene.time.delayedCall(4000, () => {
      this.setAnimation(Enemy.Animation.RUN);
      let startVelocityYSign = Math.sign(spawnConfig?.velocityY || 1);
      this.motionController.setMove(-4, -2 * startVelocityYSign);

      scene.time.delayedCall(2000, () => {
        this.setAnimation(Enemy.Animation.RUN);
        this.motionController.setRevertY();

        scene.time.delayedCall(3000, () => {
          this.setAnimation(Enemy.Animation.WALK);
          this.motionController.setMove(-1, spawnConfig?.velocityY || 0);
        });
      });
    });
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
  }
}