import { BloodController, createSimpleBloodConfig } from "../controllers/BloodController";
import { MotionController2 } from "../controllers/MotionController2";
import { DamageableController } from "../controllers/DamageableController";
import { ShadowEntity } from "./ShadowEntity";
import { Decals } from "../types/decals";
import { emitEvent } from "../Events";
import { hexToNumber } from "../../utils/colors";
import { Enemy } from "../types/enemyTypes";
import { ScoreEvents } from "../types/scoreTypes";
import { createSpriteAnimation } from "../../utils/sprite";
import { Damageable } from "../types/damageableTypes";

export class EnemyEntity implements Damageable.Entity {
  private id: string;
  private destroyed: boolean = false;
  private scene: Phaser.Scene;
  private gameObject: Phaser.Physics.Arcade.Sprite;
  private body: Phaser.Physics.Arcade.Body;
  private container: Phaser.GameObjects.Container;

  private bloodController: BloodController;
  private damageableController: DamageableController;
  private motionController: MotionController2;

  private graphics!: Phaser.GameObjects.Graphics;
  private shadow: ShadowEntity;
  private config: Enemy.Config;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, config: Enemy.Config) {
    this.id = id;
    this.config = config;
    this.scene = scene;

    this.container = scene.add.container(x, y);
    this.gameObject = scene.physics.add.sprite(config.offset.x, config.offset.y, config.animations.walk.key).setScale(config.scale).setDepth(1000);
    this.body = scene.physics.add.body(x, y, config.body.main.width, config.body.main.height);;

    this.bloodController = new BloodController(scene);
    this.damageableController = new DamageableController({ health: config.health, permeability: 0 });
    this.motionController = new MotionController2(scene, this.body, config.motion);

    this.createAnimations(scene, config);

    this.motionController.setMove(-1, 1);
    this.gameObject.play(config.animations.walk.key, true);

    this.shadow = new ShadowEntity(scene, this.gameObject, config.shadow);
    
    if (this.config.debug) {
      this.graphics = scene.add.graphics();
    }

    this.container.add(this.gameObject);
    this.container.add(this.shadow);
    scene.add.existing(this.container);
  }

  public takeDamage(damage: Damageable.Damage): Damageable.DamageResult | null {
    if (this.damageableController.getDead()) return null;

    const isHeadHit = this.isHeadHit(damage);
    if (isHeadHit && this.config.body.head?.damageMultiplier) {
      damage.value *= this.config.body.head.damageMultiplier;
    }
    const result = this.damageableController.takeDamage(damage);

    this.createBloodSplash(damage, isHeadHit);

    if (result?.isDead) {
      this.onDeath();
    }

    return result;
  }

  private createAnimations(scene: Phaser.Scene, config: Enemy.Config): void {
    if (config.animations.walk) {
      createSpriteAnimation(scene, config.animations.walk);
    }
    if (config.animations.death) {
      createSpriteAnimation(scene, config.animations.death);
    }
  }

  private addScore(score: number, playerId: string): void {
    emitEvent(this.scene, ScoreEvents.IncreaseScoreEvent, { score, playerId });
  }

  protected onDeath(): void {
    const lastDamage = this.damageableController.getLastDamage()!;

    this.motionController.setMove(0, 0);
    this.addScore(this.config.score.value, lastDamage.damage.playerId);

    if (this.config.animations.death) {
      this.gameObject.play(this.config.animations.death.key).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        const matrix = this.gameObject.getWorldTransformMatrix();
        emitEvent(this.scene, Enemy.Events.Death.Local, {
          id: this.id,
        });
        emitEvent(this.scene, Decals.Events.Local, {
          type: 'body',
          x: matrix.tx,
          y: matrix.ty,
          object: this.gameObject,
        });
        this.destroy();
      });
    } else {
      const matrix = this.gameObject.getWorldTransformMatrix();
      emitEvent(this.scene, Enemy.Events.Death.Local, {
        id: this.id,
      });
      emitEvent(this.scene, Decals.Events.Local, {
        type: 'body',
        x: matrix.tx,
        y: matrix.ty,
        object: this.gameObject,
      });
      this.destroy();
    }
  }

  protected createBloodSplash({ forceVector, hitPoint }: Damageable.Damage, isHeadHit: boolean): void {
    const multiplier = isHeadHit ? 1.2 : 1;
    const forceOrigin = { x: forceVector[0][0], y: forceVector[0][1] }; // Откуда летела пуля
    const bulletConfig = createSimpleBloodConfig(multiplier);
    this.bloodController.createBloodSplash(hitPoint[0], hitPoint[1], forceOrigin, bulletConfig);
  }

  public update(time: number, delta: number): void {
    this.motionController.update(time, delta);

    const position = this.motionController.getPosition();

    this.container.setPosition(position.x, position.y);
    this.container.setDepth(position.depth);
    
    this.shadow.update(time, delta);

    if (this.config.debug) {
      this.graphics.clear();
      this.graphics.setDepth(1000);
      this.graphics.fillStyle(hexToNumber('#000000'));
      this.graphics.setAlpha(1);
      this.graphics.fillRect(this.body.x, this.body.y, 3, 3);
      this.debugDrawMain();
      if (this.config.body.head) {
        this.debugDrawHead();
      }
    }
  }

  private debugDrawHead(): void {
    const bounds = this.getHeadBounds();
    if (!bounds) return;

    this.graphics.setDepth(1000);
    this.graphics.fillStyle(hexToNumber('#f71414'));
    this.graphics.setAlpha(0.5);
    this.graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private debugDrawMain(): void {
    const bounds = this.getBodyBounds();

    this.graphics.setDepth(1000);
    this.graphics.fillStyle(hexToNumber('#27ed89'));
    this.graphics.setAlpha(0.5);
    this.graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private isHeadHit(damage: Damageable.Damage): boolean {
    const headBounds = this.getHeadBounds();
    if (!headBounds) return false;

    const { x, y, width, height } = headBounds;
    return damage.hitPoint[0] >= x && damage.hitPoint[0] <= x + width && damage.hitPoint[1] >= y && damage.hitPoint[1] <= y + height;
  }

  public getBodyBounds(): Damageable.Body {

    // x + config.body.main.x - config.body.main.width / 2, 
    // y + config.body.main.y - config.body.main.height / 2, 
    // config.body.main.width, 
    // config.body.main.height

    return {
      x: this.body.x - this.body.width / 2,
      y: this.body.y - this.body.height / 2,
      width: this.body.width,
      height: this.body.height,
    };
  }

  public getHeadBounds(): Damageable.Body | null {
    if (!this.config.body.head) {
      return null
    }
    return {
      x: this.body.x - this.body.width / 2 + this.config.body.head.x,
      y: this.body.y - this.body.height / 2 + this.config.body.head.y,
      width: this.config.body.head.width,
      height: this.config.body.head.height,
    };
  }

  public getDead(): boolean {
    return this.damageableController.getDead();
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.gameObject.destroy();
    this.motionController.destroy();
    this.destroyed = true;
    this.shadow.destroy();

    if (this.config.debug) {
      this.graphics.destroy();
    }
  }
}
