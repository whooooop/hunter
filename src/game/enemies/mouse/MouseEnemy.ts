import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { MouseConfig } from "./config";

export class MouseEnemy extends EnemyEntity {
  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, MouseConfig);
  }

  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
  // }

  // public destroy(): void {
  //   super.destroy();
  // }
}