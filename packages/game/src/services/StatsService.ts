import { GameStorage } from "../GameStorage";
import { Stats } from "../types";

export class StatsService {
  private static instance: StatsService;
  private storage: GameStorage;
  private storageKey: string = "Stat.v1";
  private state!: Stats.Storage.State;
  private isInitialized: boolean = false;

  private static readonly defaultState: Stats.Storage.State = {
    gameplays: 0,
  };

  private constructor() {
    this.storage = new GameStorage();
    (window as any)._ss = this;
  }

  static incGameplay(): void {
    const instance = StatsService.getInstance();
    instance.state.gameplays++;
    instance.save();
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
    instance.isInitialized = true;
  }

  static getStats(): Stats.Storage.State {
    const instance = StatsService.getInstance();
    return { ...instance.state };
  }

  private async save(): Promise<void> {
    await this.storage.set(this.storageKey, this.state);
  }

}
