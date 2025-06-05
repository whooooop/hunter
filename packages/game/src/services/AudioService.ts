import { GameStorage } from "../GameStorage";
import { Audio } from "../types";

export interface AudioServicePlayConfig {
  loop?: boolean;
}

export class AudioService {
  private static instance: AudioService;
  private storage: GameStorage;
  private storageKey: string = "AudioSettings.v1";
  private settings!: Audio.Settings;
  private isInitialized: boolean = false;

  private static readonly defaultState: Audio.Settings = {
    muted: false,
    globalVolume: 0.6,
    musicVolume: 0.2,
    effectVolume: 0.6,
    interfaceVolume: 1,
    ambienceVolume: 1,
  };

  private mapAssetTypeToSettingsKey = new Map<Audio.Type, keyof Audio.Settings>([
    [Audio.Type.Music, 'musicVolume'],
    [Audio.Type.Effect, 'effectVolume'],
    [Audio.Type.Interface, 'interfaceVolume'],
    [Audio.Type.Ambience, 'ambienceVolume'],
  ]);

  private constructor() {
    console.log('AudioService constructor');
    this.storage = new GameStorage();
  }

  private static getInstance(checkInitialized: boolean = true): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }

    if (checkInitialized && !AudioService.instance.isInitialized) {
      throw new Error("AudioService is not initialized");
    }

    return AudioService.instance;
  }

  static async init(): Promise<void> {
    const instance = AudioService.getInstance(false);
    const state = await instance.storage.get<Audio.Settings>(instance.storageKey);
    if (!state) {
      instance.settings = { ...AudioService.defaultState };
    } else {
      instance.settings = { ...AudioService.defaultState, ...state };
    }
    instance.isInitialized = true;
  }

  static getSettings(): Audio.Settings {
    const instance = AudioService.getInstance();
    return { ...instance.settings };
  }

  static getSettingsValue(key: keyof Audio.Settings): Audio.Settings[keyof Audio.Settings] {
    const settings = AudioService.getSettings();
    return settings[key];
  }

  static setSettingsValue<K extends keyof Audio.Settings>(key: K, value: Audio.Settings[K]): void {
    const instance = AudioService.getInstance();
    instance.settings[key] = value;
    AudioService.saveSettings();
  }

  static playAudio(scene: Phaser.Scene, asset: Audio.Asset, config?: AudioServicePlayConfig): void {
    const instance = AudioService.getInstance();

    if (instance.settings.muted || instance.settings.globalVolume === 0) {
      return;
    }

    const volume = instance.getVolume(asset);
    const loop = config?.loop ?? false;

    scene.sound.play(asset.key, { volume, loop });
  }

  private getVolume(asset: Audio.Asset): number {
    const typeVolume: number = this.settings[this.mapAssetTypeToSettingsKey.get(asset.type) as keyof Audio.Settings] as number ?? 1;
    const volume = (asset.volume ?? 1) * typeVolume * this.settings.globalVolume;
    return volume;
  }

  private static async saveSettings(): Promise<void> {
    const instance = AudioService.getInstance();
    await instance.storage.set(instance.storageKey, instance.settings);
  }

}
