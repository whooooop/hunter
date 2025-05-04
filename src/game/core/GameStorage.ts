// export enum StorageStrategy {
//   Local = 'local',
//   Remote = 'remote',
// }

export class GameStorage {
  // private storage: Map<string, any> = new Map();
  // private strategy: StorageStrategy = StorageStrategy.Local;

  public async get<T>(key: string): Promise<T | null> {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return value as T;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    if (typeof value === 'object') {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      // @ts-ignore
      window.localStorage.setItem(key, value.toString());
    }
  }

  public async delete(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  } 
}