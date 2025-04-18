import { BloodController, createSimpleBloodConfig } from "../controllers/BloodController";
import { MotionController } from "../controllers/MotionController";
import { Damage } from "../types/damage";
import { ScoreKill } from "../../../types/score";
import { DamageableEntity, DamageableEntityBounds, DamageResult } from "./DamageableEntity";
import { ShadowEntity } from "./ShadowEntity";
import { DecalEventPayload } from "../types/decals";
import { emitEvent } from "../Events";
import { hexToNumber } from "../../utils/colors";
import { EnemyEntityEvents, EnemyEntityOptions } from "../types/enemyTypes";
import { ScoreEvents } from "../types/scoreTypes";

export class EnemyEntity extends DamageableEntity {
  protected destroyed: boolean = false;
  protected scene: Phaser.Scene;
  protected bloodController: BloodController;
  protected motionController: MotionController;
  protected debug: boolean;
  private graphics!: Phaser.GameObjects.Graphics;
  protected shadow: ShadowEntity;
  protected score: ScoreKill;

  constructor(scene: Phaser.Scene, id: string, gameObject: Phaser.Physics.Arcade.Sprite, x: number, y: number, options: EnemyEntityOptions) {
    super(gameObject, id, { health: options.health, permeability: 0 });

    this.debug = options.debug || false;

    this.bloodController = new BloodController(scene);
    this.motionController = new MotionController(scene, this.gameObject, {
      depthOffset: options.depthOffset,
      acceleration: options.acceleration,
      deceleration: options.deceleration,
      maxVelocityX: options.maxVelocityX,
      maxVelocityY: options.maxVelocityY,
      friction: options.friction,
      direction: options.direction,
    });

    this.shadow = new ShadowEntity(scene, gameObject, options.shadow);
    
    this.scene = scene;
    this.score = options.score;
    if (this.debug) {
      this.graphics = scene.add.graphics();
    }

    scene.add.existing(gameObject);
  }

  public takeDamage(damage: Damage): DamageResult | null {
    if (this.isDead) return null;
    const isHeadHit = this.isHeadHit(damage);
    const result = super.takeDamage(damage);

    this.createBloodSplash(damage, isHeadHit);

    return result;
  }

  private addScore(score: number, playerId: string): void {
    emitEvent(this.scene, ScoreEvents.IncreaseScoreEvent, { score, playerId });
  }

  protected onDeath(): void {
    const payload: DecalEventPayload = { particle: this.gameObject, x: this.gameObject.x, y: this.gameObject.y };
    const lastDamage = this.damages[this.damages.length - 1];

    emitEvent(this.scene, EnemyEntityEvents.enemyDeath, payload);
    
    this.addScore(this.score.value, lastDamage.damage.playerId);
    this.destroy();
  }

  protected createBloodSplash({ forceVector, hitPoint }: Damage, isHeadHit: boolean): void {
    const multiplier = isHeadHit ? 1.2 : 1;
    const forceOrigin = { x: forceVector[0][0], y: forceVector[0][1] }; // Откуда летела пуля
    const bulletConfig = createSimpleBloodConfig(multiplier);
    this.bloodController.createBloodSplash(hitPoint[0], hitPoint[1], forceOrigin, bulletConfig);
  }

  public update(time: number, delta: number): void {
    if (!this.gameObject || !this.gameObject.active) {
      return; 
    }
    
    super.update(time, delta);
  
    this.motionController.update(time, delta);
    this.shadow.update(time, delta);

    if (this.debug) {
      this.graphics.clear();
      this.drawBody();
      this.drawHead();
    }
  }

  private drawHead(): void {
    const bounds = this.getHeadBounds();
    if (!bounds) return;

    this.graphics.setDepth(1000);
    this.graphics.fillStyle(hexToNumber('#f71414'));
    this.graphics.setAlpha(0.5);
    this.graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private drawBody(): void {
    const bounds = this.getBounds();

    this.graphics.setDepth(1000);
    this.graphics.fillStyle(hexToNumber('#27ed89'));
    this.graphics.setAlpha(0.5);
    this.graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private isHeadHit(damage: Damage): boolean {
    const headBounds = this.getHeadBounds();
    if (!headBounds) return false;

    const { x, y, width, height } = headBounds;
    return damage.hitPoint[0] >= x && damage.hitPoint[0] <= x + width && damage.hitPoint[1] >= y && damage.hitPoint[1] <= y + height;
  }

  public getHeadBounds(): DamageableEntityBounds | null {
    return null
  }

  public getDestroyed(): boolean {
    return this.destroyed;
  }

  public destroy(): void {
    if (this.destroyed) return;

    super.destroy();
    this.gameObject.destroy();
    this.motionController.destroy();
    this.destroyed = true;
    this.shadow.destroy();
  }
}
