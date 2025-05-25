import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { CapibaraConfig } from "./config";

export class CapibaraEnemy extends EnemyEntity {

  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, CapibaraConfig, state, storage);
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}