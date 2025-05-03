// export enum StorageStrategy {
//   Local = 'local',
//   Remote = 'remote',
// }

export class GameStorage {
  // private storage: Map<string, any> = new Map();
  // private strategy: StorageStrategy = StorageStrategy.Local;

  public async get<T>(key: string): Promise<T | null> {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  public async delete(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  } 
}