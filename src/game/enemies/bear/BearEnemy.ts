import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { BearConfig } from "./config";

export class BearEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, BearConfig);
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}