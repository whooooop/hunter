import { LevelController } from "../controllers/LevelController";
import { LevelTutorialController } from "../tutorial/LevelTutorialController";
import { Level } from "../types/levelTypes";
import { DesertLevelConfig } from "./desert";
import { ForestLevelConfig } from "./forest";
import { TutorialLevelConfig } from './tutorial';

export enum LevelId {
  TUTORIAL = 'tutotial',
  FOREST = 'forest',
  SOON = 'soon',
}

export const LevelCollection: Record<LevelId, Level.Config> = {
  [LevelId.TUTORIAL]: TutorialLevelConfig,
  [LevelId.FOREST]: ForestLevelConfig,
  [LevelId.SOON]: DesertLevelConfig,
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
