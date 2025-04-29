import { EnemyEntity } from "../../core/entities/EnemyEntity";
import { RabbitConfig } from "./configs";
import { AntiAimBehavior } from "../../behaviors/AntiAimBehavior";

export class RabbitEnemy extends EnemyEntity {
  private antiAimBehavior: AntiAimBehavior;
  
  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, RabbitConfig);

    this.antiAimBehavior = new AntiAimBehavior(scene, this);
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
    this.antiAimBehavior.update(time, delta);
  }

  public destroy(): void {
    super.destroy();
    this.antiAimBehavior.destroy();
  }
}