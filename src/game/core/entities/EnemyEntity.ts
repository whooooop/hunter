import { createSimpleBloodConfig } from "../controllers/BloodController";
import { MotionController2 } from "../controllers/MotionController2";
import { DamageableController } from "../controllers/DamageableController";
import { emitEvent } from "../Events";
import { hexToNumber } from "../../utils/colors";
import { SpineGameObject, TrackEntry } from "@esotericsoftware/spine-phaser";
import { DEBUG } from "../../config";
import { Game, Blood, Enemy, Location, Damageable, ScoreEvents, Decals } from "../types";
import { Logger } from "../../../utils/logger";

const logger = new Logger('EnemyEntity');

const DEFAULT_MOTION = {
  // acceleration: 100,
  // deceleration: 20,
  // maxVelocityX: 50,
  // maxVelocityY: 40,
  // friction: 0,

  acceleration: 800,
  deceleration: 200,
  friction: 800,
  maxVelocityX: 50,
  maxVelocityY: 30,
}

export class EnemyEntity implements Damageable.Entity {
  private id: string;
  private destroyed: boolean = false;
  private scene: Phaser.Scene;
  protected spineObject!: SpineGameObject;
  private body: Phaser.Physics.Arcade.Body;
  protected container: Phaser.GameObjects.Container;
  private timeScaleTarget: number = 1;

  private bounds: Location.Bounds | null = null;

  private trackEntry: TrackEntry | null = null;
  private damageableController: DamageableController;
  protected motionController: MotionController2;

  private graphics!: Phaser.GameObjects.Graphics;
  private config: Enemy.Config;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, config: Enemy.Config, spawnConfig?: Partial<Enemy.SpawnConfig>) {
    this.id = id;
    this.config = { ...config, ...spawnConfig };
    this.scene = scene;

    // this.createAnimations(scene, this.config);

    this.container = scene.add.container(x, y);
    
    const motionConfig: Enemy.Motion = { ...DEFAULT_MOTION, ...this.config.motion };

    if (config.spine) {
      this.spineObject = scene.add.spine(0, 0, config.spine!.key, config.spine!.key);
      this.spineObject.setScale(config.scale).setOrigin(0.5);
      this.spineObject.animationState.setAnimation(0, Enemy.Animation.WALK, true);
      this.container.add(this.spineObject);
    }

    this.body = scene.physics.add.body(x, y, this.config.baunds.body.width, this.config.baunds.body.height);

    this.damageableController = new DamageableController({ health: this.config.health, permeability: 0 });
    this.motionController = new MotionController2(scene, this.body, motionConfig);

    this.setAnimation(Enemy.Animation.WALK);

    if (this.config.velocityX || this.config.velocityY) {
      this.motionController.setMove(this.config.velocityX || -1, this.config.velocityY || 0);
    }
    
    if (DEBUG.ENEMIES) {
      this.graphics = scene.add.graphics();
    }

    scene.add.existing(this.container);

    // const deathAnimation = this.config.animations.find(animation => animation.name === 'walk')!.key;

    // setTimeout(() => {
    //     const emitter = this.scene.add.particles(
    //       0,
    //       0,
    //       deathAnimation,
    //         {
    //             speed: { min: -300, max: 300 },
    //             angle: { min: 0, max: 360 },
    //             lifespan: 1200,
    //             quantity: 50,
    //             gravityY: 400,
    //         }
    //     );
    //     this.container.add(emitter);

    //     emitter.explode(50, 0, 0);

    // }, 4000);
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

      emitEvent(this.scene, Game.Events.Stat.Local, {
        event: Game.Events.Stat.EnemyDamageEvent.Event,
        data: {
          enemyType: this.config.type,
          weaponName: damage.weaponName,
          body: target,
          damage: damage.value,
        }
      });

      if (result?.isDead) {
        const killCombo = this.findKillCombo();
        if (killCombo) {
          this.addScore(killCombo.value, damage.playerId);
          emitEvent(this.scene, Game.Events.Stat.Local, {
            event: Game.Events.Stat.ComboKillEvent.Event,
            data: {
              enemyType: this.config.type,
            }
          });
        }
        this.onDeath();
      }

      if (result.isDead) {
        emitEvent(this.scene, Game.Events.Stat.Local, {
          event: Game.Events.Stat.EnemyKillEvent.Event,
          data: {
            enemyType: this.config.type,
            weaponName: damage.weaponName,
            body: target,
            oneShotKill: result.oneShotKill,
            distance: damage.distance,
          }
        });
      }
    }

    return result;
  }

  // private createAnimations(scene: Phaser.Scene, config: Enemy.Config): void {
  //   config.animations?.forEach(animation => {
  //     this.animations.set(animation.name, animation);
  //     createSpriteAnimation(scene, animation);
  //   });
  // }

  private addScore(score: number, playerId: string): void {
    emitEvent(this.scene, ScoreEvents.IncreaseScoreEvent, { score, playerId });
  }

  private calculateScore(damage: Damageable.Damage, result: Damageable.DamageResult): number {
    return this.config.score.find(rule => {
      return (
        (!rule.target || rule.target === result.target) &&
        (rule.death === -1 || rule.death === result.isDead) &&
        (!rule.weapon || rule.weapon === damage.weaponName) &&
        (typeof rule.maxPenCount === 'number' ? damage.penetratedCount <= rule.maxPenCount : true)
      )
    })?.value || 0;
  }

  private findKillCombo(): Enemy.killCombo | undefined {
    const damages = this.damageableController.getDamages();
    return this.config.killCombo?.find(combo => {
      let lastIndex = -1;
      return combo.rules.every(rule => {
        return damages.find(({ damage, result }, index) => {
          if (
            (index > lastIndex) &&
            (!rule.target || rule.target === result.target) &&
            (!rule.weapon || rule.weapon === damage.weaponName)
          ) {
            lastIndex = index;
            return true;
          }
        });
      });
    });
  }

  protected setAnimation(animation: Enemy.Animation, loop: boolean = true): void {
    if (this.config.spine?.animations[animation]) {
      this.trackEntry = this.spineObject.animationState.setAnimation(0, animation, loop);
    } else {
      logger.warn('Animation not found', animation);
    }
  }

  setAnimationSpeedScale(scale: number): void {
    if (!this.trackEntry) return;
    const animationConfig = this.config.spine?.animations[this.trackEntry.animation?.name as Enemy.Animation];

    if (this.trackEntry.animation?.name === Enemy.Animation.DEATH || this.trackEntry.animation?.name === Enemy.Animation.DEATH_HEAD) {
      this.timeScaleTarget = 1 * (animationConfig?.timeScale || 1);
    } else {
      this.timeScaleTarget = scale * (animationConfig?.timeScale || 1);
    }
  }

  protected async onDeath(): Promise<void> {
    this.motionController.setMove(0, 0);
    await this.onDeathAnimation();
    emitEvent(this.scene, Enemy.Events.Death.Local, {
      id: this.id,
    });

    const matrix = this.spineObject.getWorldTransformMatrix();

    emitEvent(this.scene, Decals.Events.Local, {
      type: 'body',
      x: matrix.tx,
      y: matrix.ty,
      object: this.spineObject as unknown as Phaser.GameObjects.Sprite,
    });
    
    this.destroy();
  }

  protected onDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      if (this.config.spine?.animations[Enemy.Animation.DEATH]) {
        this.setAnimation(Enemy.Animation.DEATH, false);
        this.spineObject.animationState.addListener({
          complete: () => resolve(),
        });
      } else {
        resolve();
      }
    });
  }

  protected createBloodSplash({ forceVector, hitPoint }: Damageable.Damage, target: Enemy.Body): void {
    const multiplier = target === 'head' ? 1.2 : 1;
    const forceOrigin = { x: forceVector[0][0], y: forceVector[0][1] };
    const bloodConfig = createSimpleBloodConfig(multiplier);
    bloodConfig.texture = Blood.Texture.drops;
    emitEvent(this.scene, Blood.Events.BloodSplash.Local, {
      x: hitPoint[0],
      y: hitPoint[1],
      originPoint: forceOrigin,
      config: bloodConfig,
    });
  }

  public update(time: number, delta: number): void {
    this.motionController.update(time, delta);

    const position = this.motionController.getPosition();
    const velocityScale = this.motionController.getVelocityScale();

    if (this.bounds) {
      if (position.y < this.bounds.top + this.body.height / 2) {
        this.motionController.setMoveDown();
      } else if (position.y > this.bounds.bottom - this.body.height / 2) {
        this.motionController.setMoveUp();
      }
    }

    this.setAnimationSpeedScale(velocityScale[0]);

    this.container.setPosition(position.x + this.config.offset.x, position.y + this.config.offset.y);
    this.container.setDepth(position.depth);

    if (this.trackEntry) {
      this.spineObject.animationState.timeScale = Phaser.Math.Linear(this.spineObject.animationState.timeScale, this.timeScaleTarget, 0.25);
    }

    if (DEBUG.ENEMIES) {
      this.graphics.clear();
      this.graphics.setDepth(1000);
      this.graphics.fillStyle(hexToNumber('#000000'));
      this.graphics.setAlpha(1);
      this.graphics.fillRect(position.x, position.y, 3, 3);
      this.debugDrawMain();
      if (this.config.baunds.head) {
        this.debugDrawHead();
      }
    }
  }

  public setLocationBounds(bounds: Location.Bounds): void {
    this.bounds = bounds;
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

  public getPosition(): { x: number, y: number, jumpHeight: number, depth: number } {
    return this.motionController.getPosition();
  }

  public jump(height: number = 100, duration: number = 500): void {
    this.motionController.jump(height, duration);
  }

  public applyForce(vectorX: number, vectorY: number, force: number, strength?: number, decayRate?: number): void {
    this.motionController.applyForce(vectorX, vectorY, force, strength, decayRate);
  }

  public getHealth(): { current: number, max: number } {
    return {
      current: this.damageableController.getHealth(),
      max: this.config.health,
    };
  }

  public getBodyBounds(): Damageable.Body {
    const position = this.motionController.getPosition();
    return {
      x: position.x - this.body.width / 2 + this.config.baunds.body.x,
      y: position.y - this.body.height / 2 + this.config.baunds.body.y,
      width: this.body.width,
      height: this.body.height,
    };
  }

  public getHeadBounds(): Damageable.Body | null {
    const position = this.motionController.getPosition();
    if (!this.config.baunds.head) {
      return null
    }
    return {
      x: position.x - this.body.width / 2 + this.config.baunds.head.x,
      y: position.y - this.body.height / 2 + this.config.baunds.head.y,
      width: this.config.baunds.head.width,
      height: this.config.baunds.head.height,
    };
  }

  public getDead(): boolean {
    return this.damageableController.getDead();
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.spineObject?.destroy();
    this.body.destroy();
    this.motionController.destroy();
    this.destroyed = true;

    if (DEBUG.ENEMIES) {
      this.graphics.destroy();
    }
  }
}
