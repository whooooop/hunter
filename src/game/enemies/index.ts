import { EnemyEntity } from "../core/entities/EnemyEntity";
import { Enemy } from "../core/types/enemyTypes";
import { loadSprite, loadSpriteSheet } from "../utils/sprite";
import { RabbitConfig } from "./rabbit/configs";
import { RabbitEnemy } from "./rabbit/RabbitEnemy";
import { MouseConfig } from "./mouse/config";
import { MouseEnemy } from "./mouse/MouseEnemy";
import { BearConfig } from "./bear/config";
import { BearEnemy } from "./bear/BearEnemy";

export const EnemyCollections: Record<Enemy.Type, {
  config: Enemy.Config,
  enemy: new (scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) => EnemyEntity
}> = {
  [Enemy.Type.RABBIT]: {
    config: RabbitConfig,
    enemy: RabbitEnemy,
  },
  [Enemy.Type.MOUSE]: {
    config: MouseConfig,
    enemy: MouseEnemy,
  },
  [Enemy.Type.BEAR]: {
    config: BearConfig,
    enemy: BearEnemy,
  },
}

export function preloadEnemies(scene: Phaser.Scene, enemies: Enemy.Type[]): void {
  enemies.forEach(enemy => {
    const EnemyConfig = EnemyCollections[enemy].config;
    EnemyConfig.animations.forEach(animation => {
      loadSpriteSheet(scene, animation);
    });
    if (EnemyConfig.texture) {
      loadSprite(scene, EnemyConfig.texture);
    }
  });
}

export function createEnemy(id: string, enemyType: Enemy.Type, scene: Phaser.Scene, spawnConfig: Enemy.SpawnConfig): EnemyEntity {
  return new EnemyCollections[enemyType].enemy(scene, id, spawnConfig);
}