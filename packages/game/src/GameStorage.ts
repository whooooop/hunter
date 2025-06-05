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
    const encryptedKey = await this.getEncryptedKey(key);
    const value = await window.bridge.storage.get(encryptedKey, this.strategy);

    if (!value) {
      return null;
    }
    try {
      const decryptedValue = await decrypt(value, this.salt);
      try {
        return JSON.parse(decryptedValue);
      } catch (error) {
        return decryptedValue as T;
      }
    } catch (error) {
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    let data: string;

    if (typeof value === 'object') {
      data = JSON.stringify(value);
    } else {
      // @ts-ignore
      data = value.toString();
    }

    const encryptedKey = await this.getEncryptedKey(key);
    const encryptedData = await encrypt(data, this.salt);
    await window.bridge.storage.set(encryptedKey, encryptedData, this.strategy);
  }

  public async delete(key: string): Promise<void> {
    const encryptedKey = await this.getEncryptedKey(key);
    await window.bridge.storage.delete(encryptedKey, this.strategy);
  }

  private async getEncryptedKey(key: string): Promise<string> {
    return encrypt(this.prefix + key, this.salt + key);
  }
}