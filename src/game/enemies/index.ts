import { EnemyEntity } from "../core/entities/EnemyEntity";
import { Enemy } from "../core/types/enemyTypes";
import { loadSpriteSheet } from "../utils/sprite";
import { RabbitConfig } from "./rabbit/configs";

export const EnemyConfigs: Record<Enemy.Type, Enemy.Config> = {
  [Enemy.Type.RABBIT]: RabbitConfig,
}

export function preloadEnemies(scene: Phaser.Scene, enemies: Enemy.Type[]): void {
  enemies.forEach(enemy => {
    const EnemyConfig = EnemyConfigs[enemy];
    if (EnemyConfig.animations.walk) {
      loadSpriteSheet(scene, EnemyConfig.animations.walk);
    }
    if (EnemyConfig.animations.death) {
      loadSpriteSheet(scene, EnemyConfig.animations.death);
    }
  });
}

export function getEnemyConfig(enemyType: Enemy.Type): Enemy.Config {
  return EnemyConfigs[enemyType];
}

export function createEnemy(id: string, enemyType: Enemy.Type, scene: Phaser.Scene, x: number, y: number, options?: any | Enemy.Config): EnemyEntity {
  const EnemyConfig = getEnemyConfig(enemyType);
  return new EnemyEntity(scene, id, x, y, EnemyConfig);
}