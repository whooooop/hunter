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

  static assets = new Map<string, Audio.Asset>();

  private music = new Map<Audio.Asset, Phaser.Sound.BaseSound>();

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
    this.storage = new GameStorage();
    (window as any)._ss = this;
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

  static preloadAsset(scene: Phaser.Scene, asset: Audio.Asset): void {
    if (AudioService.assets.has(asset.key)) {
      return;
    }
    AudioService.assets.set(asset.key, asset);
    if (!scene.cache.audio.exists(asset.key)) {
      scene.load.audio(asset.key, asset.url);
      AudioService.assets.set(asset.key, asset);
    }
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

  static async setSettingsValue<K extends keyof Audio.Settings>(key: K, value: Audio.Settings[K]): Promise<void> {
    const instance = AudioService.getInstance();
    instance.settings[key] = value;
    await AudioService.saveSettings();

    if (key === 'musicVolume' || key === 'globalVolume' || key === 'muted') {
      instance.updateMusicVolume();
    }
  }

  private updateMusicVolume(): void {
    for (const [asset, music] of this.music.entries()) {
      const volume = this.getVolume(asset);
      if ('volume' in music) {
        music.volume = volume;
        if ('setVolume' in music && typeof (music as any).setVolume === 'function') {
          (music as any).setVolume(volume);
        }
      }
    }
  }

  static playAudio(scene: Phaser.Scene, key: string, config?: AudioServicePlayConfig): void {
    const instance = AudioService.getInstance();

    const asset = AudioService.assets.get(key);
    if (!asset) {
      throw new Error(`Audio asset with key ${key} not found`);
    }

    const volume = instance.getVolume(asset);
    const loop = config?.loop ?? false;

    if (asset.type === Audio.Type.Music) {
      if (!instance.music.has(asset)) {
        instance.music.set(asset, scene.sound.add(asset.key));
      }
      const music = instance.music.get(asset);
      music?.play({ volume });
    } else {
      scene.sound.play(asset.key, { volume, loop });
    }
  }

  static createAudio(scene: Phaser.Scene, asset: Audio.Asset, config?: AudioServicePlayConfig): Phaser.Sound.BaseSound {
    const instance = AudioService.getInstance();
    const volume = instance.getVolume(asset);
    const loop = config?.loop ?? false;
    return scene.sound.add(asset.key, { volume, loop });
  }

  static stopAllMusic(scene: Phaser.Scene, duration: number): void {
    const instance = AudioService.getInstance();
    for (const [asset, music] of instance.music.entries()) {
      scene.tweens.add({
        targets: music,
        volume: 0,
        duration,
        ease: 'linear',
        onComplete: () => {
          music.stop();
        }
      });
    }
  }

  private getVolume(asset: Audio.Asset): number {
    if (this.settings.muted) {
      return 0;
    }
    const typeVolume: number = this.settings[this.mapAssetTypeToSettingsKey.get(asset.type) as keyof Audio.Settings] as number ?? 1;
    const volume = (asset.volume ?? 1) * typeVolume * this.settings.globalVolume;
    return volume;
  }

  private static async saveSettings(): Promise<void> {
    const instance = AudioService.getInstance();
    await instance.storage.set(instance.storageKey, instance.settings);
  }

}
