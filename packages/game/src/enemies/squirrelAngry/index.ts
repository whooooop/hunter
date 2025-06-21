import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { SquirrelAngryConfig } from "./config";

export class SquirrelAngryEnemy extends EnemyEntity {

  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, SquirrelAngryConfig, state, storage);

    scene.time.delayedCall(1500, () => {
      this.setAnimation(Enemy.Animation.RUN);
      let startVelocityYSign = Math.sign(state.data.vy || 1);
      let startVelocityXSign = Math.sign(state.data.vx || 1);

      this.motionController.setMove(startVelocityXSign * 1.5, startVelocityYSign * 3);

      scene.time.delayedCall(2000, () => {
        this.motionController.setRevertY();
      });
      scene.time.delayedCall(4000, () => {
        this.motionController.setMove(startVelocityXSign * 3, startVelocityYSign * 1);
      });
    });
  }
}