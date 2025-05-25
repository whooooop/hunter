import { SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { DeerConfig } from "./config";

export class DeerEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>) {
    super(scene, id, DeerConfig, state);

    // scene.time.delayedCall(4000, () => {
    //   this.setAnimation(Enemy.Animation.RUN);
    //   let startVelocityYSign = Math.sign(state.data.vy || 1);
    //   this.motionController.setMove(-6, -0.2 * startVelocityYSign);
    // });
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
  }
}