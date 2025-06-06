export enum StorageStrategy {
  Local = 'local_storage',
  Remote = 'platform_internal',
}
import { decrypt, encrypt } from "./utils/crypto";

export class GameStorage {
  constructor(
    private readonly strategy: StorageStrategy = StorageStrategy.Local,
    private readonly prefix: string = 'h_',
    private readonly salt: string = 'huntsman',
  ) { }

  public async get<T>(key: string): Promise<T | null> {
    if (!key) {
      console.warn('Empty key provided to GameStorage.get');
      return null;
    }

    const encryptedKey = await this.getEncryptedKey(key);
    const value = await window.bridge.storage.get(encryptedKey, this.strategy);

    if (!value) {
      return null;
    }
    try {
      const decryptedValue = await decrypt(value, this.salt);
      if (!decryptedValue) {
        return null;
      }
      try {
        return JSON.parse(decryptedValue);
      } catch (error) {
        return decryptedValue as T;
      }
    } catch (error) {
      console.error('Error decrypting value:', error);
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    if (!key) {
      console.warn('Empty key provided to GameStorage.set');
      return;
    }

    let data: string;
    try {
      if (typeof value === 'object') {
        data = JSON.stringify(value);
      } else {
        // @ts-ignore
        data = value.toString();
      }
    } catch (error) {
      console.error('Error stringifying value:', error);
      return;
    }

    const encryptedKey = await this.getEncryptedKey(key);
    const encryptedData = await encrypt(data, this.salt);

    if (!encryptedData) {
      console.error('Failed to encrypt data');
      return;
    }

    await window.bridge.storage.set(encryptedKey, encryptedData, this.strategy);
  }

  public async delete(key: string): Promise<void> {
    if (!key) {
      console.warn('Empty key provided to GameStorage.delete');
      return;
    }

    const encryptedKey = await this.getEncryptedKey(key);
    await window.bridge.storage.delete(encryptedKey, this.strategy);
  }

  private async getEncryptedKey(key: string): Promise<string> {
    if (!key) {
      console.warn('Empty key provided to getEncryptedKey');
      return '';
    }

    const fullKey = this.prefix + key;
    const fullSalt = this.salt + key;

    const encryptedKey = await encrypt(fullKey, fullSalt);
    if (!encryptedKey) {
      console.error('Failed to encrypt key');
      return '';
    }

    return encryptedKey;
  }
}