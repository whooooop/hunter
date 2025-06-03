import { EnemyEntity } from "../entities/EnemyEntity";
import { offEvent, onEvent } from "../GameEvents";
import { Weapon } from "../types";

export class AntiAimBehavior {
  protected scene: Phaser.Scene;
  protected enemy: EnemyEntity;

  private aimPoints: Map<string, { x: number, y: number }> = new Map();
  private lastJumpTime: number = 0;
  private jumpDelay: number = 2000;
  private jumpHeight: number = 50;
  private jumpDuration: number = 340;

  constructor(scene: Phaser.Scene, enemy: EnemyEntity) {
    this.scene = scene;
    this.enemy = enemy;
    onEvent(scene, Weapon.Events.AimPoint.Local, this.setAimPoint, this)
  }

  private setAimPoint(payload: Weapon.Events.AimPoint.Payload): void {
    this.aimPoints.set(payload.playerId, payload.targetPoint);
  }

  public update(time: number, delta: number): void {
    const position = this.enemy.getPosition();
    const bodyBounds = this.enemy.getBodyBounds();

    this.aimPoints.forEach((aimPoint, playerId) => {
      const halfHeight = bodyBounds.height / 2;
      if (aimPoint.y < position.y + halfHeight && aimPoint.y > position.y - halfHeight) {

        if (time - this.lastJumpTime > this.jumpDelay) {
          this.enemy.jump(this.jumpHeight, this.jumpDuration);
          // this.enemy.applyForce(aimPoint.x * -1, aimPoint.y - 10, 10, 11, 0.01);
          this.lastJumpTime = time;
        }
      }
    })
  }

  public destroy(): void {
    offEvent(this.scene, Weapon.Events.AimPoint.Local, this.setAimPoint, this);
  }
}