import { Level } from "../types/levelTypes";
import { ForestLevelConfig } from "./forest";
import { DesertLevelConfig } from "./desert";

export enum LevelId {
  FOREST = 'forest',
  SOON = 'soon',
  SOON2 = 'soon2',
}

export const LevelCollection: Record<LevelId, Level.Config> = {
  [LevelId.FOREST]: ForestLevelConfig,
  [LevelId.SOON]: DesertLevelConfig,
  [LevelId.SOON2]: DesertLevelConfig,
}

export function getLevelConfig(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}

export function getLevel(levelId: LevelId): Level.Config {
  return LevelCollection[levelId];
}

