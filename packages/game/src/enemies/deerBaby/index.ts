import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { DeerBabyConfig } from "./config";

export class DeerBabyEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, DeerBabyConfig, state, storage);
  }
}