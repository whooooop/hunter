import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { SquireelConfig } from "./config";

export class SquireelEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, SquireelConfig, state, storage);
  }
}