import * as Phaser from 'phaser';
import { EnemyEntity } from '../../core/entities/EnemyEntity';
import { createSpriteAnimation, loadSpriteSheet } from '../../utils/sprite';
import { entityConfig, deathConfig,walkConfig } from './configs';
import { DamageableEntityBounds } from '../../core/entities/DamageableEntity';

interface RabbitEnemyOptions {
  moveX: number;
  moveY: number;
  direction: number;
  health: number;
}

export class RabbitEnemy extends EnemyEntity {
  name: string = 'Rabbit';

  static preload(scene: Phaser.Scene): void {
    loadSpriteSheet(scene, walkConfig);
    loadSpriteSheet(scene, deathConfig);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, options: RabbitEnemyOptions) {
    const gameObject = scene.physics.add.sprite(x, y, walkConfig.key);
    gameObject.setScale(walkConfig.scale);

    super(scene, id, gameObject, x, y, {
      ...entityConfig,
      health: options.health || entityConfig.health,
    });
    
    this.motionController.setMove(-1, 1);

    createSpriteAnimation(scene, walkConfig);
    createSpriteAnimation(scene, deathConfig);

    gameObject.play(walkConfig.key, true);
  }

  protected onDeath(): void {
    this.motionController.setMove(0, 0);
    this.gameObject.play(deathConfig.key).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      super.onDeath();
    });
  }
  
  public getBounds(): DamageableEntityBounds {
    const bounds = super.getBounds();
    return {
      x: bounds.x,
      y: bounds.y + 24,
      width: bounds.width - 56,
      height: bounds.height - 38,
    };
  }

  public getHeadBounds(): DamageableEntityBounds | null {
    const bounds = this.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width - 10,
      height: bounds.height - 24,
    };
  }
} 