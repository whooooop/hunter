import * as Phaser from 'phaser';
import { EnemyEntity } from '../../core/entities/EnemyEntity';
import { createSpriteAnimation, loadSpriteSheet } from '../../utils/sprite';
import { entityConfig, deathConfig,walkConfig } from './configs';

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

  constructor(scene: Phaser.Scene, x: number, y: number, options: RabbitEnemyOptions) {
    const gameObject = scene.physics.add.sprite(x, y, walkConfig.key);
    gameObject.setScale(walkConfig.scale);

    super(scene, gameObject, x, y, {
      ...entityConfig,
      health: options.health || entityConfig.health,
    });
    
    this.motionController.setMove(-1, 1);

    createSpriteAnimation(scene, walkConfig);
    createSpriteAnimation(scene, deathConfig);

    gameObject.play(walkConfig.key, true);
  }

  protected onDead(): void {
    this.motionController.setMove(0, 0);
    this.gameObject.play(deathConfig.key).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      super.onDead();
    });
  }
  
  protected getHeadBounds(): [number, number, number, number] {
    const [HeadX, HeadY, HeadWidth, HeadHeight] = super.getHeadBounds();
    return [HeadX, HeadY, HeadWidth / 2, HeadHeight - 18];
  }
} 