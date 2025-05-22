import { EnemyEntity } from "../entities/EnemyEntity";
import { Enemy } from "../types/enemyTypes";
import { loadSprite, loadSpriteSheet } from "../utils/sprite";
import { HareEnemy } from "./hare";
import { HareConfig } from "./hare/config";
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
import { DeerBabyConfig } from "./deerBaby/config";
import { DeerBabyEnemy } from "./deerBaby";
import { SquireelConfig } from "./squireel/config";
import { SquireelEnemy } from "./squireel";
import { SquirrelAngryConfig } from "./squirrelAngry/config";
import { SquirrelAngryEnemy } from "./squirrelAngry";
import { WolfConfig } from "./wolf/config";
import { WolfEnemy } from "./wolf";

export const EnemyCollections: Record<Enemy.Type, {
  config: Enemy.Config,
  enemy: new (scene: Phaser.Scene, id: string, spawnConfig: Enemy.SpawnConfig) => EnemyEntity
}> = {
  [Enemy.Type.HARE]: {
    config: HareConfig,
    enemy: HareEnemy,
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
  [Enemy.Type.DEER_BABY]: {
    config: DeerBabyConfig,
    enemy: DeerBabyEnemy,
  },
  [Enemy.Type.SQUIREEL]: {
    config: SquireelConfig,
    enemy: SquireelEnemy,
  },
  [Enemy.Type.SQUIRREL_ANGRY]: {
    config: SquirrelAngryConfig,
    enemy: SquirrelAngryEnemy,
  },
  [Enemy.Type.WOLF]: {
    config: WolfConfig,
    enemy: WolfEnemy,
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