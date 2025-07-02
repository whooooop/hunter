import { SpineGameObject, TrackEntry } from "@esotericsoftware/spine-phaser";
import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { EnemyAnimationEvent, EnemyDeathEvent } from "@hunter/storage-proto/src/storage";
import { DEBUG } from "../config";
import { createSimpleBloodConfig } from "../controllers/BloodController";
import { DamageableController } from "../controllers/DamageableController";
import { MotionController2 } from "../controllers/MotionController2";
import { emitEvent } from "../GameEvents";
import { enemyAnimationEvent, enemyDeathEventCollection } from "../storage/collections/events.collection";
import { Blood, Damageable, Decals, Enemy, Game, Location, ScoreEvents } from "../types/";
import { hexToNumber } from "../utils/colors";
import { Logger } from "../utils/logger";
import { generateId } from "../utils/stringGenerator";

const logger = new Logger('EnemyEntity');

const DEFAULT_MOTION = {
  acceleration: 800,
  deceleration: 200,
  friction: 800,
  maxVelocityX: 50,
  maxVelocityY: 30,
}

export class EnemyEntity implements Damageable.Entity {
  private destroyed: boolean = false;
  protected spineObject!: SpineGameObject;
  private body: Phaser.Physics.Arcade.Body;
  protected container: Phaser.GameObjects.Container;
  private timeScaleTarget: number = 1;

  private bounds: Location.Bounds | null = null;
  protected wounded: boolean = false;

  private trackEntry: TrackEntry | null = null;
  private damageableController: DamageableController;
  protected motionController: MotionController2;

  private graphics!: Phaser.GameObjects.Graphics;

  private _handleEnemyDeath: (enemyId: string, record: SyncCollectionRecord<EnemyDeathEvent>) => void;
  private _handleEnemyAnimation: (eventId: string, record: SyncCollectionRecord<EnemyAnimationEvent>) => void;

  static preload(scene: Phaser.Scene): void {
  }

  constructor(
    protected readonly scene: Phaser.Scene,
    public readonly id: string,
    protected readonly config: Enemy.Config,
    protected readonly state: SyncCollectionRecord<Enemy.State>,
    protected readonly storage: StorageSpace
  ) {
    // this.config = { ...config, ...state.data };

    this.container = scene.add.container(this.state.data.x, this.state.data.y);

    const motionConfig: Enemy.Motion = { ...DEFAULT_MOTION, ...this.config.motion };

    if (config.spine) {
      this.spineObject = scene.add.spine(0, 0, config.spine!.key, config.spine!.key);
      this.spineObject.setScale(config.scale).setOrigin(0.5);
      this.spineObject.animationState.setAnimation(0, Enemy.Animation.WALK, true);
      this.container.add(this.spineObject);
    }

    this.body = scene.physics.add.body(this.state.data.x, this.state.data.y, this.config.baunds.body.width, this.config.baunds.body.height);

    this.damageableController = new DamageableController({ health: this.state.data.health, permeability: 0 });
    this.damageableController.setState(this.state);
    this.motionController = new MotionController2(scene, this.body, motionConfig);
    this.motionController.setState(this.state);
    this.setAnimation(Enemy.Animation.WALK);

    if (!this.state.readonly) {
      if (this.state.data.vx || this.state.data.vy) {
        this.motionController.setMove(this.state.data.vx, this.state.data.vy);
      }
    }

    if (DEBUG.ENEMIES) {
      this.graphics = scene.add.graphics();
    }

    scene.add.existing(this.container);

    this._handleEnemyDeath = this.handleEnemyDeath.bind(this);
    this._handleEnemyAnimation = this.handleEnemyAnimation.bind(this);
    this.storage.on<EnemyDeathEvent>(enemyDeathEventCollection, 'Add', this._handleEnemyDeath);
    this.storage.on<EnemyAnimationEvent>(enemyAnimationEvent, 'Add', this._handleEnemyAnimation);
  }

  setMoveSpeed(vx: number, vy: number) {
    this.motionController.setMove(vx, vy);
  }

  private handleEnemyDeath(enemyId: string, record: SyncCollectionRecord<EnemyDeathEvent>): void {
    if (enemyId === this.id) {
      this.onDeath({
        damage: record.data.damage,
        target: record.data.target as Enemy.Body,
      });
    }
  }

  private handleEnemyAnimation(eventId: string, record: SyncCollectionRecord<EnemyAnimationEvent>): void {
    if (record.data.enemyId === this.id) {
      this.playAnimation(record.data.animation as Enemy.Animation, record.data.loop);
    }
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

    this.createBloodSplash(damage, target);

    if (result && !damage.simulate) {
      const score = this.calculateScore(damage, result);
      this.addScore(score, damage.playerId);

      if (this.damageableController.getHealthPercent() < 0.3 && !this.wounded) {
        this.wounded = true;
        this.motionController.decreaseSpeed(0.3);
        this.setAnimation(Enemy.Animation.WOUNDED);
      }

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
        this.motionController.setMove(0, 0);
        this.onDeath({
          damage: damage.value,
          target: target,
        });
        this.storage.getCollection<EnemyDeathEvent>(enemyDeathEventCollection)!.addItem(this.id, {
          damage: damage.value,
          target: target,
        });
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
    if (!this.state.readonly && this.config.spine?.animations[animation] && this.trackEntry?.animation?.name !== animation) {
      this.storage.getCollection<EnemyAnimationEvent>(enemyAnimationEvent)!.addItem(generateId(), {
        enemyId: this.id,
        animation,
        loop,
      });
      this.playAnimation(animation, loop);
    }
  }

  private playAnimation(animation: Enemy.Animation, loop: boolean = true): void {
    this.trackEntry = this.spineObject.animationState.setAnimation(0, animation, loop);
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

  protected async onDeath({ damage, target }: { damage: number, target: Enemy.Body }): Promise<void> {
    const position = this.motionController.getPosition();
    const maxParticleCount = this.scene.sys.game.device.os.desktop ? 80 : 30;
    const minDamage = 90;
    const particleCount = Math.max(0, Math.min(maxParticleCount, Math.floor(Math.max(damage - minDamage, 0) / minDamage * maxParticleCount)));

    emitEvent(this.scene, Blood.Events.DeathFountain.Local, {
      x: position.x,
      y: position.y,
      config: {
        particleCount: particleCount,
        fountainRatio: 0.75,
        scale: { min: 0.1, max: 0.35 },
        groundVariation: 40,
        randomness: { x: 8, y: 60 },
      }
    });

    await this.onDeathAnimation(3000);

    const matrix = this.spineObject.getWorldTransformMatrix();

    emitEvent(this.scene, Decals.Events.Local, {
      type: 'body',
      x: matrix.tx,
      y: matrix.ty,
      object: this.spineObject as unknown as Phaser.GameObjects.Sprite,
    });

    emitEvent(this.scene, Enemy.Events.Death.Local, {
      id: this.id,
    });

    this.destroy();
  }

  protected onDeathAnimation(fallbackDuration: number = 0): Promise<void> {
    return new Promise(resolve => {
      if (this.config.spine?.animations[Enemy.Animation.DEATH]) {
        const timeout = fallbackDuration ? this.scene.time.delayedCall(fallbackDuration, () => {
          resolve();
        }) : null;
        this.setAnimation(Enemy.Animation.DEATH, false);
        this.spineObject.animationState.addListener({
          complete: () => {
            resolve();
            timeout?.destroy();
          },
        });
      } else {
        resolve();
      }
    });
  }

  protected createBloodSplash({ forceVector, hitPoint }: Damageable.Damage, target: Enemy.Body): void {
    const multiplier = target === 'head' ? 1.2 : 1;
    const forceOrigin = { x: forceVector[0][0], y: forceVector[0][1] };
    const amount = this.scene.sys.game.device.os.desktop ? Phaser.Math.Between(20, 35) : Phaser.Math.Between(15, 25);
    const bloodConfig = createSimpleBloodConfig(amount * multiplier);
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

    if (this.trackEntry && this.scene.time.timeScale) {
      this.spineObject.animationState.timeScale = Phaser.Math.Linear(this.spineObject.animationState.timeScale, this.timeScaleTarget, 0.25);
    } else {
      this.spineObject.animationState.timeScale = 0;
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

  public getHealthPercent(): number {
    return this.damageableController.getHealthPercent();
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
    this.storage.off<EnemyDeathEvent>(enemyDeathEventCollection, 'Add', this._handleEnemyDeath);
    this.storage.off<EnemyAnimationEvent>(enemyAnimationEvent, 'Add', this._handleEnemyAnimation);
    this.spineObject?.destroy();
    this.body.destroy();
    this.motionController.destroy();
    this.container.destroy();
    this.destroyed = true;

    if (DEBUG.ENEMIES) {
      this.graphics.destroy();
    }
  }
}
