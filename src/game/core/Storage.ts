export enum StorageStrategy {
  Local = 'local',
  Remote = 'remote',
}

export class Storage {
  private storage: Map<string, any> = new Map();
  private strategy: StorageStrategy = StorageStrategy.Local;

  public get(key: string): any {
    return this.storage.get(key);
  }

  public set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  public delete(key: string): void {
    this.storage.delete(key);
  } 
}