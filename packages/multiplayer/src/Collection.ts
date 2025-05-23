import { StorageSpace } from "./StorageSpace";
import { SyncCollectionEvents } from "./sync";
import { BinaryWriter } from "@bufbuild/protobuf/dist/cjs/wire/binary-encoding";

export type CollectionId = string;
type SyncCollectionEvent = keyof typeof SyncCollectionEvents;
type FromUpdate = 'Server' | 'Client';

export interface SyncCollectionConfig<T> {
  localEvents?: boolean,
  // clearOnDisconnect?: boolean,
  // limit?: number,
  saveData?: boolean,
  throttle?: number,
  reactive?: boolean,
  encode: (data: T) => BinaryWriter,
  decode: (data: Uint8Array) => T,
}

export function defineCollection<T extends object>(id: string, config: SyncCollectionConfig<T>): CollectionId {
  SyncCollection.registry.set(id, config as unknown as SyncCollectionConfig<object>);
  return id;
}

export class SyncCollection<T extends object> {
  static readonly registry: Map<string, SyncCollectionConfig<object>> = new Map();

  private collection: Map<string, { data: T }> = new Map();
  private subscribers: Set<{event: SyncCollectionEvent, callback: (collection: SyncCollection<T>, from: FromUpdate, id: string, data: any) => void}> = new Set();
  private subscribersCount = new Map<SyncCollectionEvent, number>([
    ['Add', 0],
    ['Update', 0],
    ['Remove', 0],
  ]);

  private lastSendTime: Map<string, number> = new Map();
  private pendingUpdates: Map<string, { data: T, timer: NodeJS.Timeout }> = new Map();
  private __onSendBuffer: ((collectionId: string, event: SyncCollectionEvents, id: string, bytes: Uint8Array, excludeClientId?: string) => void) | null = null;

  constructor(
    private readonly id: CollectionId,
    private readonly storage: StorageSpace,
    private readonly config: SyncCollectionConfig<T>
  ) {}

  static create<T extends object>(id: string, storage: StorageSpace): SyncCollection<T> | null {
    const config = SyncCollection.registry.get(id);
    if (!config) {
      console.error(`Collection ${id} not found`);
      return null;
    }
    return new SyncCollection<T>(id, storage, config as unknown as SyncCollectionConfig<T>);
  }

  public getId(): string {
    return this.id;
  }
  
  public getSize(): number {
    return this.collection.size;
  }

  public has(id: string): boolean {
    return this.collection.has(id);
  }

  public subscribe(event: 'Remove', callback: (collection: SyncCollection<T>, from: FromUpdate, id: string) => void): void 
  public subscribe(event: 'Update', callback: (collection: SyncCollection<T>, from: FromUpdate, id: string, data: T) => void): void 
  public subscribe(event: 'Add', callback: (collection: SyncCollection<T>, from: FromUpdate, id: string, data: T) => void): void 
  public subscribe(event: SyncCollectionEvent, callback: (collection: SyncCollection<T>, from: FromUpdate, id: string, data: any) => void): void {
    this.subscribers.add({ event, callback });
    this.subscribersCount.set(event, this.subscribersCount.get(event)! + 1);
  }

  public unsubscribe(event: SyncCollectionEvent, callback: (collection: SyncCollection<T>, from: FromUpdate, id: string, data: any) => void): void {
    this.subscribers.delete({ event, callback });
    this.subscribersCount.set(event, this.subscribersCount.get(event)! - 1);
  }

  public addItem(id: string, data: T): void {
    if (this.config.saveData) {
      this.localAdd(id, data);
    }
    this.sendAdd(id, data);
    this.sendEvent('Add', 'Client', id, data);
  }

  public updateItem(id: string, data: T): void {
    if (this.config.saveData) {
      this.localUpdate(id, data);
    }
    this.sendUpdate(id, data);
    this.sendEvent('Update', 'Client', id, data);
  }

  public removeItem(id: string): void {
    if (this.config.saveData) {
      this.sendRemove(id);
    }
    this.localRemove(id);
    this.sendEvent('Remove', 'Client', id, undefined);
  }

  public import(itemIds: string[], bytes: Uint8Array[]): void {
    const data = bytes.map(byte => this.config.decode(byte));
    itemIds.forEach((id, index) => {
      this.localAdd(id, data[index]);
    });
  }

  public getIds(): string[] {
    return Array.from(this.collection.keys());
  }

  public getItem(id: string): T | undefined {
    return this.collection.get(id)?.data;
  }

  public getItems(): T[] {
    return Array.from(this.collection.values())
      .map(item => item.data);
  }

  public encodeAll(): Uint8Array[] {
    return Array.from(this.collection.values())
      .map(item => this.config.encode(item.data).finish()); 
  }

  private localAdd(id: string, data: T): void {
    const reactive = this.config.reactive;
    const onChange = (key: keyof T, value: any, oldValue: any) => {
      this.sendUpdate(id, data);
    };
    if (reactive) {
      const proxy = new Proxy(data as object, {
        set(obj: any, key: string | symbol, value: any) {
          const oldValue = obj[key];
          if (oldValue !== value) {
            obj[key] = value;
            onChange(key as keyof T, value, oldValue);
          }
        return true;
        }
      });
      this.collection.set(id, { data: proxy as T });
    } else {
      this.collection.set(id, { data });
    }
  }

  private localUpdate(id: string, data: T): void {
    const item = this.collection.get(id);
    if (item) {
      Object.assign(item.data, data);
    } else {
      this.localAdd(id, data);
    }
  }

  private localRemove(id: string): void {
    this.collection.delete(id);
  }

  private sendUpdate(id: string, data: T): void {
    const throttleTime = this.config.throttle || 0;
    const now = Date.now();
    const lastSend = this.lastSendTime.get(id) || 0;
    
    if (throttleTime > 0) {
      const pending = this.pendingUpdates.get(id);
      if (pending) {
        clearTimeout(pending.timer);
      }

      if (now - lastSend >= throttleTime) {
        this.sendUpdateMessage(id, data);
      } else {
        const timeToWait = throttleTime - (now - lastSend);
        const timer = setTimeout(() => {
          this.sendUpdateMessage(id, data);
          this.pendingUpdates.delete(id);
        }, timeToWait);
        
        this.pendingUpdates.set(id, { data, timer });
      }
    } else {
      this.sendUpdateMessage(id, data);
    }
  }

  private sendUpdateMessage(id: string, data: T): void {
    const messageBytes = this.config.encode(data).finish();
    this.sendBuffer(id, SyncCollectionEvents.Update, messageBytes);
    this.lastSendTime.set(id, Date.now());
  }

  private sendRemove(id: string): void {
    this.sendBuffer(id, SyncCollectionEvents.Remove, new Uint8Array());
  }

  private sendAdd(id: string, data: T): void {
    const messageBytes = this.config.encode(data).finish();
    this.sendBuffer(id, SyncCollectionEvents.Add, messageBytes);
  }

  private sendBuffer(id: string, event: SyncCollectionEvents, bytes: Uint8Array, excludeClientId?: string) {
    this.storage.__sendBuffer(this.id, event, id, bytes, excludeClientId);
  }

  public remoteUpdate(id: string, bytes: Uint8Array, broadcast: boolean = false, excludeClientId?: string): void {
    if (this.config.saveData || this.subscribersCount.get('Update')! > 0) {
      const data = this.config.decode(bytes);
      this.localUpdate(id, data);
      this.sendEvent('Update', 'Server', id, data);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Update, bytes, excludeClientId);
    }
  }
  
  public remoteRemove(id: string, broadcast: boolean = false, excludeClientId?: string): void {
    if (this.config.saveData || this.subscribersCount.get('Remove')! > 0) {
      this.localRemove(id);
      this.sendEvent('Remove', 'Server', id, undefined);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Remove, new Uint8Array(), excludeClientId);
    }
  }

  public remoteAdd(id: string, bytes: Uint8Array, broadcast: boolean = false, excludeClientId?: string): void {
    if (this.config.saveData || this.subscribersCount.get('Add')! > 0) {
      const data = this.config.decode(bytes);
      this.localAdd(id, data);
      this.sendEvent('Add', 'Server', id, data);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Add, bytes, excludeClientId);
    }
  }

  public sendEvent(event: SyncCollectionEvent, from: FromUpdate, id: string, data: any): void {
    if (!this.config.localEvents && from === 'Client') {
      return;
    }
    this.subscribers.forEach(listener => {
      if (listener.event === event) {
        listener.callback(this, from, id, data);
      }
    });
  }
}

