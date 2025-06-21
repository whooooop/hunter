import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { CapybaraConfig } from "./config";

export class CapybaraEnemy extends EnemyEntity {

  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, CapybaraConfig, state, storage);
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}