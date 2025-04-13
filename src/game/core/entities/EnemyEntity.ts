import { BloodController } from "../controllers/BloodController";
import { MotionController } from "../controllers/MotionController";
import { Demage } from "../types/demage";
import { DamageableEntity } from "./DamageableEntity";

interface EnemyEntityOptions {
  health: number;
  depthOffset: number;
  acceleration: number;
  deceleration: number;
  maxVelocityX: number;
  maxVelocityY: number;
  friction: number;
  direction: number;
}

export class EnemyEntity extends DamageableEntity {
  protected destroyed: boolean = false;
  protected bloodController: BloodController;
  protected motionController: MotionController;

  constructor(scene: Phaser.Scene, gameObject: Phaser.Physics.Arcade.Sprite, x: number, y: number, options: EnemyEntityOptions) {
    super(gameObject, { health: options.health });

    this.bloodController = new BloodController(scene);
    this.motionController = new MotionController(scene, this.gameObject, {
      debug: {
        showPositions: true,
        showPath: true,
      },
      depthOffset: options.depthOffset,
      acceleration: options.acceleration,
      deceleration: options.deceleration,
      maxVelocityX: options.maxVelocityX,
      maxVelocityY: options.maxVelocityY,
      friction: options.friction,
      direction: options.direction,
    });

    scene.add.existing(gameObject);
  }

  public takeDamage(damage: Demage): void {
    super.takeDamage(damage);

    const health = this.damageController.getHealth();

    this.createBloodSplash(damage);

    if (health <= 0) {
      this.destroy();
    }
  }

  protected createBloodSplash({ forceVector, hitPoint }: Demage): void {
    const [x, y] = hitPoint;
    const [[startX, startY], [forceX, forceY]] = forceVector;
    const direction = forceX - startX;

    this.bloodController.createBloodSplash(x, y,
      {
        amount: Phaser.Math.Between(50, 100),
        direction,
        force: 20,
        size: {
          min: 0.2,
          max: 0.3
        },
        speed: {
          min: 500,
          max: 1080,
          multiplier: 0.6
        },
        gravity: 700,
        spread: {
          angle: Math.PI/14,
          height: {
            min: -3, // Разброс вверх от точки попадания
            max: 2   // Разброс вниз от точки попадания
          }
        },
        fallDistance: {
          min: 15,
          max: 25
        },
        // minXDistance: 380      // Минимальная дистанция разлета по оси X
      }
    );
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
    this.motionController.update(time, delta);
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
  }
}
