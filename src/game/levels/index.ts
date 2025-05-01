import { Level } from "../core/types/levelTypes";
import { ForestLevelConfig } from "./forest";

export enum LevelId {
  FOREST = 'forest',
}

export const LevelCollection: Record<LevelId, Level.Config> = {
  [LevelId.FOREST]: ForestLevelConfig,
}

export function getLevelConfig(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}

export function getLevel(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}

