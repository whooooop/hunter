import { BloodController, createSimpleBloodConfig } from "../controllers/BloodController";
import { MotionController } from "../controllers/MotionController";
import { Demage } from "../types/demage";
import { ScoreKill } from "../../../types/score";
import { DamageableEntity, DamageResult } from "./DamageableEntity";
import { ShadowEntity } from "./ShadowEntity";

export interface EnemyEntityOptions {
  health: number;
  depthOffset?: number;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  friction: number;
  direction: number;
  score: ScoreKill;
  debug?: boolean;
}

export class EnemyEntity extends DamageableEntity {
  protected destroyed: boolean = false;
  protected bloodController: BloodController;
  protected motionController: MotionController;
  protected debug: boolean;

  private graphics: Phaser.GameObjects.Graphics;
  protected shadow: ShadowEntity;

  constructor(scene: Phaser.Scene, gameObject: Phaser.Physics.Arcade.Sprite, x: number, y: number, options: EnemyEntityOptions) {
    super(gameObject, { health: options.health, permeability: 0 });

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

    this.shadow = new ShadowEntity(scene, gameObject);
    this.graphics = scene.add.graphics();

    scene.add.existing(gameObject);
  }

  public takeDamage(damage: Demage): DamageResult | null {
    if (this.isDead) return null;

    const result = super.takeDamage(damage);
    const health = this.getHealth();

    this.createBloodSplash(damage);

    return result;
  }

  protected onDeath(): void {
    this.destroy();
  }

  protected createBloodSplash({ forceVector, hitPoint }: Demage): void {
    const [x, y] = hitPoint;
    const [[startX, startY], [forceX, forceY]] = forceVector;
    const direction = forceX - startX;

    this.bloodController.createBloodSplash(x, y, createSimpleBloodConfig(direction));
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  
    this.motionController.update(time, delta);
    this.shadow.update(time, delta);

    if (this.debug) {
      this.graphics.clear();
      this.drawHead();
    }
  }

  private drawHead(): void {
    const [HeadX, HeadY, HeadWidth, HeadHeight] = this.getHeadBounds();
    this.graphics.setDepth(1000);
    this.graphics.fillStyle(0x000000);
    this.graphics.setAlpha(0.5);
    this.graphics.fillRect(HeadX, HeadY, HeadWidth, HeadHeight);
  }

  protected getHeadBounds(): [number, number, number, number] {
    const width = this.gameObject.width * this.gameObject.scaleX;
    const height = this.gameObject.height * this.gameObject.scaleY;
    const x = this.gameObject.x - width / 2;
    const y = this.gameObject.y - height / 2;

    return [x, y, width, height];
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
