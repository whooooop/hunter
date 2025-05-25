import { SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types/enemyTypes";
import { RaccoonConfig } from "./config";

export class RaccoonEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>) {
    super(scene, id, RaccoonConfig, state);
  }
}