import { SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { BearConfig } from "./config";

export class BearEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>) {
    super(scene, id, BearConfig, state);

    // scene.time.delayedCall(4000, () => {
    //   this.setAnimation(Enemy.Animation.RUN);
    //   let startVelocityYSign = Math.sign(spawnConfig?.velocityY || 1);
    //   this.motionController.setMove(-3, -0.2 * startVelocityYSign);
    // });
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
  }
}