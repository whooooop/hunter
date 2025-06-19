import { GameStorage } from "../GameStorage";
import { LevelId } from "../levels";
import { Stats } from "../types";

export class StatsService {
  private static instance: StatsService;
  private storage: GameStorage;
  private storageKey: string = "Stat.v1";
  private storageLevelStatsKey: string = "Stat.v1.levelStats";
  private state!: Stats.Storage.State;
  private isInitialized: boolean = false;
  private levelStats: Map<LevelId, Stats.Storage.LevelStats> = new Map();

  private static readonly defaultState: Stats.Storage.State = {
    gameplays: 0,
  };

  private static readonly defaultLevelStats: Stats.Storage.LevelStats = {
    bestScore: 0,
    gameplays: 0,
  };

  private constructor() {
    this.storage = new GameStorage();
    (window as any)._ss = this;
  }

  static incGameplay(levelId: LevelId): void {
    const instance = StatsService.getInstance();
    instance.state.gameplays++;
    instance.save();

    const levelStats = instance.levelStats.get(levelId)!;
    levelStats.gameplays++;
    instance.levelStats.set(levelId, levelStats);
    instance.saveLevelStats(levelId);
  }

  static setBestScore(levelId: LevelId, score: number): void {
    const instance = StatsService.getInstance();
    const levelStats = instance.levelStats.get(levelId)!;

    if (score > levelStats.bestScore) {
      levelStats.bestScore = score;
      instance.levelStats.set(levelId, levelStats);
      instance.saveLevelStats(levelId);
    }
  }

  private static getInstance(checkInitialized: boolean = true): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }

    if (checkInitialized && !StatsService.instance.isInitialized) {
      throw new Error("StatsService is not initialized");
    }

    return StatsService.instance;
  }

  static async init(): Promise<void> {
    const instance = StatsService.getInstance(false);
    const state = await instance.storage.get<Stats.Storage.State>(instance.storageKey);
    if (!state) {
      instance.state = { ...StatsService.defaultState };
    } else {
      instance.state = { ...StatsService.defaultState, ...state };
    }

    for (const levelId of Object.values(LevelId)) {
      const levelStats = await instance.storage.get<Stats.Storage.LevelStats>(instance.storageLevelStatsKey + '.' + levelId);
      if (!levelStats) {
        instance.levelStats.set(levelId as LevelId, { ...StatsService.defaultLevelStats });
      } else {
        instance.levelStats.set(levelId as LevelId, { ...StatsService.defaultLevelStats, ...levelStats });
      }
    }

    instance.isInitialized = true;
  }

  static getStats(): Stats.Storage.State {
    const instance = StatsService.getInstance();
    return { ...instance.state };
  }

  static getLevelStats(levelId: LevelId): Stats.Storage.LevelStats {
    const instance = StatsService.getInstance();
    return instance.levelStats.get(levelId)!;
  }

  private async save(): Promise<void> {
    await this.storage.set(this.storageKey, this.state);
  }

  private async saveLevelStats(levelId: LevelId): Promise<void> {
    await this.storage.set(this.storageLevelStatsKey + '.' + levelId, this.levelStats.get(levelId)!);
  }

}
