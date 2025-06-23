import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { EmbienceEvent } from "@hunter/storage-proto/src/storage";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { embienceEvent } from "../../storage/collections/events.collection";
import { Enemy } from "../../types/enemyTypes";
import { generateId } from "../../utils/stringGenerator";
import { MouseConfig } from "./config";

export class MouseEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, MouseConfig, state, storage);

    if (MouseConfig.ambience?.spawn) {
      const random = Phaser.Math.Between(0, 1);
      if (random < 0.5) {
        const delay = Phaser.Math.Between(1000, 3000);
        this.scene.time.delayedCall(delay, () => {
          this.storage.getCollection<EmbienceEvent>(embienceEvent)!.addItem(generateId(), {
            assetKey: MouseConfig.ambience!.spawn.key,
          })
        });
      }
    }
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}