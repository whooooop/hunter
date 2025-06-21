import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer";
import { EnemyEntity } from "../entities/EnemyEntity";
import { AudioService } from "../services/AudioService";
import { Enemy } from "../types/enemyTypes";
import { loadSprite, loadSpriteSheet } from "../utils/sprite";
import { BearEnemy } from "./bear";
import { BearConfig } from "./bear/config";
import { CapybaraEnemy } from "./capybara";
import { CapybaraConfig } from "./capybara/config";
import { DeerEnemy } from "./deer";
import { DeerConfig } from "./deer/config";
import { DeerBabyEnemy } from "./deerBaby";
import { DeerBabyConfig } from "./deerBaby/config";
import { HareEnemy } from "./hare";
import { HareConfig } from "./hare/config";
import { HedgehogEnemy } from "./hedgehog";
import { HedgehogConfig } from "./hedgehog/config";
import { MouseConfig } from "./mouse/config";
import { MouseEnemy } from "./mouse/MouseEnemy";
import { RaccoonEnemy } from "./raccoon";
import { RaccoonConfig } from "./raccoon/config";
import { SquireelEnemy } from "./squireel";
import { SquireelConfig } from "./squireel/config";
import { SquirrelAngryEnemy } from "./squirrelAngry";
import { SquirrelAngryConfig } from "./squirrelAngry/config";
import { WolfEnemy } from "./wolf";
import { WolfConfig } from "./wolf/config";

export const EnemyCollections: Record<Enemy.Type, {
  config: Enemy.Config,
  enemy: new (scene: Phaser.Scene, id: string, record: SyncCollectionRecord<Enemy.State>, storage: StorageSpace) => EnemyEntity
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
  [Enemy.Type.CAPYBARA]: {
    config: CapybaraConfig,
    enemy: CapybaraEnemy,
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
  EnemyEntity.preload(scene);

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
    if (EnemyConfig.ambience) {
      Object.values(EnemyConfig.ambience).forEach(asset => {
        AudioService.preloadAsset(scene, asset);
      });
    }
  });
}

export function createEnemy(id: string, enemyType: Enemy.Type, scene: Phaser.Scene, state: SyncCollectionRecord<Enemy.State>, storage: StorageSpace): EnemyEntity {
  return new EnemyCollections[enemyType].enemy(scene, id, state, storage);
}