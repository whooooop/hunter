import { SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { HedgehogConfig } from "./config";

export class HedgehogEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>) {
    super(scene, id, HedgehogConfig, state);

    if (!state.readonly) {
      scene.time.delayedCall(3500, () => {
        this.setAnimation(Enemy.Animation.RUN);
        let startVelocityYSign = Math.sign(state.data.vy || 1);
        this.motionController.setMove(-6, -2 * startVelocityYSign);

        scene.time.delayedCall(2000, () => {
          this.setAnimation(Enemy.Animation.RUN);
          this.motionController.setRevertY();
        });
      });
    }
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
  }
}