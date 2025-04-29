import { EnemyEntity } from "../core/entities/EnemyEntity";
import { Enemy } from "../core/types/enemyTypes";
import { loadSpriteSheet } from "../utils/sprite";
import { RabbitConfig } from "./rabbit/configs";
import { RabbitEnemy } from "./rabbit/RabbitEnemy";

export const EnemyCollections: Record<Enemy.Type, {
  config: Enemy.Config,
  enemy: new (scene: Phaser.Scene, id: string, x: number, y: number) => EnemyEntity
}> = {
  [Enemy.Type.RABBIT]: {
    config: RabbitConfig,
    enemy: RabbitEnemy,
  },
}


export function preloadEnemies(scene: Phaser.Scene, enemies: Enemy.Type[]): void {
  enemies.forEach(enemy => {
    const EnemyConfig = EnemyCollections[enemy].config;
    EnemyConfig.animations.forEach(animation => {
      loadSpriteSheet(scene, animation);
    });
  });
}

export function createEnemy(id: string, enemyType: Enemy.Type, scene: Phaser.Scene, x: number, y: number, options?: any | Enemy.Config): EnemyEntity {
  return new EnemyCollections[enemyType].enemy(scene, id, x, y);
}