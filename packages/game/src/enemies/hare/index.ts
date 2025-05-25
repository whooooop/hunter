import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { AntiAimBehavior } from "../../behaviors/AntiAimBehavior";
import { EnemyEntity } from "../../entities/EnemyEntity";
import { Enemy } from "../../types";
import { HareConfig } from "./config";

export class HareEnemy extends EnemyEntity {
  private antiAimBehavior: AntiAimBehavior;

  constructor(scene: Phaser.Scene, id: string, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) {
    super(scene, id, HareConfig, state, storage);

    this.antiAimBehavior = new AntiAimBehavior(scene, this);
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
    // this.antiAimBehavior.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
    this.antiAimBehavior.destroy();
  }
}