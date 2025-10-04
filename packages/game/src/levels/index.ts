import { LevelController } from "../controllers/LevelController";
import { LevelTutorialController } from "../tutorial/LevelTutorialController";
import { Level } from "../types/levelTypes";
import { ForestLevelConfig } from './forest';
import { TutorialLevelConfig } from './tutorial';
import { ZombieForestLevelConfig } from './zombieForest';
export enum LevelId {
  TUTORIAL = 'tutotial',
  FOREST = 'forest',
  ZOMBIE_FOREST = 'zombie_forest',
  // SOON = 'soon',
}

export const LevelCollection: Record<LevelId, Level.Config> = {
  [LevelId.TUTORIAL]: TutorialLevelConfig,
  [LevelId.FOREST]: ForestLevelConfig,
  [LevelId.ZOMBIE_FOREST]: ZombieForestLevelConfig,
  // [LevelId.SOON]: DesertLevelConfig,
}

export const levelControllersFactory = {
  [Level.ControllerType.TUTORIAL]: LevelTutorialController,
  [Level.ControllerType.DEFAULT]: LevelController,
}

export function getLevelConfig(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}

export function getLevel(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}
