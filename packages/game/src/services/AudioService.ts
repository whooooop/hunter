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
  private static globalMuted: boolean = false;
  private static globalMutedReason: Set<string> = new Set();

  private loopSounds = new Map<string, { asset: Audio.Asset, sound: Phaser.Sound.BaseSound }>()

  private static readonly defaultState: Audio.Settings = {
    muted: false,
    globalVolume: 0.6,
    musicVolume: 0.1,
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

  static setGlobalMute(mute: boolean, reason: string): void {
    if (mute) {
      AudioService.globalMutedReason.add(reason);
    } else {
      AudioService.globalMutedReason.delete(reason);
    }
    const instance = AudioService.getInstance();
    if (AudioService.globalMutedReason.size) {
      AudioService.globalMuted = true;
    } else {
      AudioService.globalMuted = false;
    }
    instance.updateVolume();
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
      instance.updateVolume();
    }
  }

  private updateVolume(): void {
    for (const item of this.loopSounds.values()) {
      const volume = this.getVolume(item.asset);
      if ('volume' in item.sound) {
        item.sound.volume = volume;
        if ('setVolume' in item.sound && typeof (item.sound as any).setVolume === 'function') {
          (item.sound as any).setVolume(volume);
        }
      }
    }
  }

  static playAudio(scene: Phaser.Scene, assetKey: string): void {
    const instance = AudioService.getInstance();
    const item = instance.createAudio(scene, assetKey, { loop: false });
    item.sound.play();
  }

  static playAudioLoop(scene: Phaser.Scene, name: string, assetKey: string): void {
    const instance = AudioService.getInstance();

    if (instance.loopSounds.has(name)) {
      AudioService.stopLoopMusic(scene, name, 0);
    }

    const sound = AudioService.createAudioLoop(scene, name, assetKey);
    sound.play();
  }

  static createAudioLoop(scene: Phaser.Scene, name: string, assetKey: string): Phaser.Sound.BaseSound {
    const instance = AudioService.getInstance();
    const item = instance.createAudio(scene, assetKey, { loop: true });
    instance.loopSounds.set(name, item);
    return item.sound;
  }

  private createAudio(scene: Phaser.Scene, assetKey: string, config?: AudioServicePlayConfig): { asset: Audio.Asset, sound: Phaser.Sound.BaseSound } {
    const asset = AudioService.assets.get(assetKey);

    if (!asset) {
      throw new Error(`Audio asset with key ${assetKey} not found`);
    }

    const instance = AudioService.getInstance();
    const volume = instance.getVolume(asset);
    const loop = config?.loop ?? false;
    const sound = scene.sound.add(asset.key, { volume, loop });
    const item = { asset, sound };

    return item;
  }

  static stopLoopMusic(scene: Phaser.Scene, name: string, duration: number): void {
    const instance = AudioService.getInstance();
    const item = instance.loopSounds.get(name);
    if (item) {
      scene.tweens.add({
        targets: item.sound,
        volume: 0,
        duration,
        ease: 'linear'
      });
      setTimeout(() => {
        item.sound.stop()
        instance.loopSounds.delete(name);
      }, duration + 16);
    }
  }

  private getVolume(asset: Audio.Asset): number {
    if (this.settings.muted || AudioService.globalMuted) {
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
