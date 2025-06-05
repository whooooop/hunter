import { GameStorage } from "../GameStorage";
import { Settings } from "../types";

export class SettingsService {
  private static instance: SettingsService;
  private storage: GameStorage;
  private storageKey: string = "settings";
  private state!: Settings.StorageState;
  private isInitialized: boolean = false;

  private static readonly defaultState: Settings.StorageState = {
    shellCasingsEnabled: true,
    shellCasingsDecals: true,
    bloodEnabled: true,
    bloodDecals: true,
  };

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private constructor() {
    this.storage = new GameStorage();
  }

  public async init(): Promise<void> {
    const state = await this.storage.get<Settings.StorageState>(this.storageKey);
    if (!state) {
      this.state = { ...SettingsService.defaultState };
    } else {
      this.state = { ...SettingsService.defaultState, ...state };
    }
    this.isInitialized = true;
  }

  public getState(): Settings.StorageState {
    if (!this.isInitialized) {
      throw new Error("SettingsService is not initialized");
    }
    return this.state;
  }

  private async saveState(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("SettingsService is not initialized");
    }
    await this.storage.set(this.storageKey, this.state);
  }

  public getValue(key: keyof Settings.StorageState): Settings.StorageState[keyof Settings.StorageState] {
    return this.state[key];
  }

  public setValue(key: keyof Settings.StorageState, value: Settings.StorageState[keyof Settings.StorageState]): void {
    (this.state[key] as Settings.StorageState[keyof Settings.StorageState]) = value;
    this.saveState();
  }
}
