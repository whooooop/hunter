import { EnemyEntity } from "../core/entities/EnemyEntity";
import { Enemy } from "../core/types/enemyTypes";
import { loadSprite, loadSpriteSheet } from "../utils/sprite";
import { RabbitConfig } from "./rabbit/configs";
import { RabbitEnemy } from "./rabbit/RabbitEnemy";
import { MouseConfig } from "./mouse/config";
import { MouseEnemy } from "./mouse/MouseEnemy";
import { BearConfig } from "./bear/config";
import { BearEnemy } from "./bear";
import { CapibaraConfig } from "./capibara/config";
import { CapibaraEnemy } from "./capibara";
import { HedgehogConfig } from "./hedgehog/config";
import { HedgehogEnemy } from "./hedgehog";
import { RaccoonConfig } from "./raccoon/config";
import { RaccoonEnemy } from "./raccoon";
import { DeerConfig } from "./deer/config";
import { DeerEnemy } from "./deer";

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
  [Enemy.Type.CAPIBARA]: {
    config: CapibaraConfig,
    enemy: CapibaraEnemy,
  },
  [Enemy.Type.HEDGEHOG]: {
    config: HedgehogConfig,
    enemy: HedgehogEnemy,
  },
  [Enemy.Type.RACCOON]: {
    config: RaccoonConfig,
    enemy: RaccoonEnemy,
  },
  [Enemy.Type.DEER]: {
    config: DeerConfig,
    enemy: DeerEnemy,
  },
}

export function preloadEnemies(scene: Phaser.Scene, enemies: Enemy.Type[]): void {
  enemies.forEach(enemy => {
    const EnemyConfig = EnemyCollections[enemy].config;
    EnemyConfig.animations?.forEach(animation => {
      loadSpriteSheet(scene, animation);
    });
    if (EnemyConfig.texture) {
      loadSprite(scene, EnemyConfig.texture);
    }
    if (EnemyConfig.spine) {
      scene.load.spineJson(EnemyConfig.spine!.key, EnemyConfig.spine!.json)
      scene.load.spineAtlas(EnemyConfig.spine!.key, EnemyConfig.spine!.atlas)
    }
  });
}

export function createEnemy(id: string, enemyType: Enemy.Type, scene: Phaser.Scene, spawnConfig: Enemy.SpawnConfig): EnemyEntity {
  return new EnemyCollections[enemyType].enemy(scene, id, spawnConfig);
}