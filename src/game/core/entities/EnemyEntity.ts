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
  private scoreMap: Map<string, number>;

  private animations: Map<Enemy.AnimationName, Enemy.Animation> = new Map();

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, config: Enemy.Config) {
    this.id = id;
    this.config = config;
    this.scene = scene;

    this.createAnimations(scene, config);

    this.container = scene.add.container(x, y);
    this.gameObject = scene.physics.add.sprite(config.offset.x, config.offset.y, this.animations.get('walk')!.key).setScale(config.scale).setDepth(1000);
    this.body = scene.physics.add.body(x, y, config.baunds.body.width, config.baunds.body.height);;

    this.bloodController = new BloodController(scene);
    this.damageableController = new DamageableController({ health: config.health, permeability: 0 });
    this.motionController = new MotionController2(scene, this.body, config.motion);


    if (this.animations.has('walk')) {
      this.gameObject.play(this.animations.get('walk')!.key, true);
    }
    this.motionController.setMove(-1, 1);

    this.shadow = new ShadowEntity(scene, this.gameObject, config.shadow);
    
    if (this.config.debug) {
      this.graphics = scene.add.graphics();
    }

    this.scoreMap = new Map<string, number>();
    this.config.score.forEach(rule => {
      this.scoreMap.set(`${rule.target}${rule.kill}${rule.weapon}`, rule.value);
    });

    this.container.add(this.gameObject);
    this.container.add(this.shadow);
    scene.add.existing(this.container);
  }

  private getTargetDamage(damage: Damageable.Damage): Enemy.Body {
    const isHeadHit = this.isHeadHit(damage);
    return isHeadHit ? 'head' : 'body';
  }

  public takeDamage(damage: Damageable.Damage): Damageable.DamageResult | null {
    if (this.damageableController.getDead()) return null;

    const target = this.getTargetDamage(damage);
    const damageMultiplier = this.config.damageMultiplier?.[target];

    if (damageMultiplier) {
      damage.value *= damageMultiplier;
    }

    const result = this.damageableController.takeDamage(damage, target);

    if (result) {
      const score = this.calculateScore(damage, result);
      this.addScore(score, damage.playerId);
      this.createBloodSplash(damage, target);
      if (result?.isDead) {
        this.onDeath();
      }
    }

    return result;
  }

  private createAnimations(scene: Phaser.Scene, config: Enemy.Config): void {
    config.animations.forEach(animation => {
      this.animations.set(animation.name, animation);
      createSpriteAnimation(scene, animation);
    });
  }

  private addScore(score: number, playerId: string): void {
    emitEvent(this.scene, ScoreEvents.IncreaseScoreEvent, { score, playerId });
  }

  private calculateScore(damage: Damageable.Damage, result: Damageable.DamageResult): number {
    const key = [
      `${result.target}${result.isDead}${damage.weaponName}`,
      `${result.target}${result.isDead}`
    ].find(key => this.scoreMap.has(key));
    return key ? this.scoreMap.get(key)! : 0;
  }

  protected onDeath(): void {
    const lastDamage = this.damageableController.getLastDamage()!;

    this.motionController.setMove(0, 0);

    // this.addScore(this.config.score.value, lastDamage.damage.playerId);

    if (this.animations.has('death')) {
      this.gameObject.play(this.animations.get('death')!.key).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
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

  protected createBloodSplash({ forceVector, hitPoint }: Damageable.Damage, target: Enemy.Body): void {
    const multiplier = target === 'head' ? 1.2 : 1;
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
      if (this.config.baunds.head) {
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
    if (!this.config.baunds.head) {
      return null
    }
    return {
      x: this.body.x - this.body.width / 2 + this.config.baunds.head.x,
      y: this.body.y - this.body.height / 2 + this.config.baunds.head.y,
      width: this.config.baunds.head.width,
      height: this.config.baunds.head.height,
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
