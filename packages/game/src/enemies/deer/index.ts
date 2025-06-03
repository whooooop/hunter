import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { DeerConfig } from "./config";

export class DeerEnemy extends EnemyEntity {
  isWounded: boolean = false;

  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, DeerConfig, state, storage);

    // scene.time.delayedCall(4000, () => {
    //   this.setAnimation(Enemy.Animation.RUN);
    //   let startVelocityYSign = Math.sign(state.data.vy || 1);
    //   this.motionController.setMove(-6, -0.2 * startVelocityYSign);
    // });
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.state.data.level >= 3 && this.getHealthPercent() < 0.5 && !this.isWounded) {
      this.isWounded = true;
      this.setAnimation(Enemy.Animation.RUN);
      this.motionController.increaseSpeed(1.6);
    }
  }

  public destroy(): void {
    super.destroy();
  }
}