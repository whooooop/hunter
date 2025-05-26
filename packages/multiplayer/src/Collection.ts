import { BinaryWriter } from "@bufbuild/protobuf/dist/cjs/wire/binary-encoding";
import { StorageSpace } from "./StorageSpace";
import { SyncCollectionEvents } from "./sync";

export type CollectionId = string;
export type SyncCollectionEvent = keyof typeof SyncCollectionEvents;
export type FromUpdate = 'Server' | 'Client';

export interface SyncCollectionConfig<T> {
  // clearOnDisconnect?: boolean,
  // limit?: number,
  name?: string,
  localEvents?: boolean,
  saveData?: boolean,
  throttle?: number,
  reactive?: boolean,
  readonly?: boolean,
  encode: (data: T) => BinaryWriter,
  decode: (data: Uint8Array) => T,
}

export interface SyncCollectionRecord<T> {
  data: T;
  __original: T;
  readonly: boolean;
}

const defaultConfig: Partial<SyncCollectionConfig<object>> = {
  saveData: true,
  throttle: 16,
  reactive: true,
}

export function defineCollection<T extends object>(name: string, config: SyncCollectionConfig<T>): CollectionId {
  const id = generateTransferId(name);
  config.name = name;
  SyncCollection.registry.set(id, config as unknown as SyncCollectionConfig<object>);
  return id;
}

export class SyncCollection<T extends object> {
  static readonly registry: Map<string, SyncCollectionConfig<object>> = new Map();

  private collection: Map<string, SyncCollectionRecord<T>> = new Map();
  private subscribers: Set<{ event: SyncCollectionEvent, callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void }> = new Set();
  private subscribersCount = new Map<SyncCollectionEvent, number>([
    ['Add', 0],
    ['Update', 0],
    ['Remove', 0],
  ]);
  private readonly stat = new Map([
    ['ClientAdd', 0],
    ['ClientUpdate', 0],
    ['ClientRemove', 0],
    ['ServerAdd', 0],
    ['ServerUpdate', 0],
    ['ServerRemove', 0],
    ['SendAdd', 0],
    ['SendUpdate', 0],
    ['SendRemove', 0],
  ])
  private readonlyItems: Set<string> = new Set();
  private lastSendTime: Map<string, number> = new Map();
  private pendingUpdates: Map<string, { data: T, timer: NodeJS.Timeout }> = new Map();
  private __onSendBuffer: ((collectionId: string, event: SyncCollectionEvents, id: string, bytes: Uint8Array, excludeClientId?: string) => void) | null = null;

  constructor(
    private readonly id: CollectionId,
    private readonly storage: StorageSpace,
    private readonly config: SyncCollectionConfig<T>,
    private readonly name: string = config.name || ''
  ) {
    this.config = { ...defaultConfig, ...config };
  }

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

  public subscribe(event: 'Remove', callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): void
  public subscribe(event: 'Update', callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): void
  public subscribe(event: 'Add', callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): void
  public subscribe(event: SyncCollectionEvent, callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): void {
    this.subscribers.add({ event, callback });
    this.subscribersCount.set(event, this.subscribersCount.get(event)! + 1);
  }

  public unsubscribe(event: SyncCollectionEvent, callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): void {
    this.subscribers.delete({ event, callback });
    this.subscribersCount.set(event, this.subscribersCount.get(event)! - 1);
  }

  public addItem(id: string, data: T): void {
    if (this.config.saveData) {
      this.localAdd(id, data);
    }

    const record = this.collection.get(id);
    this.sendAdd(id, data);
    this.sendEvent('Add', 'Client', id, record!);
  }

  public updateItem(id: string, data: T): void {
    if (this.config.saveData) {
      this.localUpdate(id, data);
    }

    const record = this.collection.get(id);
    this.sendUpdate(id, data);
    this.sendEvent('Update', 'Client', id, record!);
  }

  public removeItem(id: string): void {
    const record = this.collection.get(id);

    if (this.config.saveData) {
      this.localRemove(id);
    }

    this.sendRemove(id);
    this.sendEvent('Remove', 'Client', id, record!);
  }

  public import(itemIds: string[], bytes: Uint8Array[]): void {
    const data = bytes.map(byte => this.config.decode(byte));
    itemIds.forEach((id, index) => {
      const record = this.collection.get(id);

      if (record) {
        return;
      }

      if (this.config.saveData) {
        this.localAdd(id, data[index]);
      }

      this.sendEvent('Add', 'Server', id, this.collection.get(id)!);
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

  public setReadonly(value: boolean, id?: string): void {
    if (id) {
      if (value) {
        const item = this.collection.get(id);
        this.readonlyItems.add(id);
        item && (item.readonly = true);
      } else {
        this.readonlyItems.delete(id);
        const item = this.collection.get(id);
        item && (item.readonly = false);
      }
    } else {
      this.config.readonly = value;
      this.collection.forEach(item => item.readonly = value);
    }
  }

  public forEach(callback: (item: SyncCollectionRecord<T>, id: string, collection: SyncCollection<T>) => void): void {
    this.collection.forEach((item, id) => {
      callback(item, id, this);
    });
  }

  public encodeAll(): Uint8Array[] {
    return Array.from(this.collection.values())
      .map(item => this.config.encode(item.data).finish());
  }

  private localAdd(id: string, data: T): SyncCollectionRecord<T> {
    const reactive = this.config.reactive;
    const readonly = this.config.readonly ?? this.readonlyItems.has(id);
    const __original = data;
    let result: SyncCollectionRecord<T>;

    const item = this.collection.get(id);
    if (item) {
      return item;
    }

    this.incrementStat('ClientAdd');
    const onChange = (key: keyof T, value: any, oldValue: any) => {
      // console.log('onChange', key, value, oldValue);
      const record = this.collection.get(id)!;
      this.sendEvent('Update', 'Client', id, record);
      this.sendUpdate(id, data);
    };

    if (reactive) {
      const proxy = new Proxy(data as object, {
        set: (obj: any, key: string | symbol, value: any) => {
          if (readonly) {
            return false;
          }
          const oldValue = obj[key];
          if (oldValue !== value) {
            obj[key] = value;
            onChange(key as keyof T, value, oldValue);
          }
          return true;
        }
      });
      result = { data: proxy as T, __original, readonly };
    } else {
      result = { data, __original, readonly };
    }

    if (this.config.saveData) {
      this.collection.set(id, result!);
    }

    return result!;
  }

  private localUpdate(id: string, data: T): SyncCollectionRecord<T> {
    this.incrementStat('ClientUpdate');
    const item = this.collection.get(id);
    if (item) {
      Object.keys(data).forEach((key: string) => {
        item.__original[key as keyof T] = data[key as keyof T];
      });
      return item;
    } else {
      return this.localAdd(id, data);
    }
  }

  private localRemove(id: string): void {
    this.incrementStat('ClientRemove');
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
    this.incrementStat('SendUpdate');
  }

  private sendRemove(id: string): void {
    this.sendBuffer(id, SyncCollectionEvents.Remove, new Uint8Array());
    this.incrementStat('SendRemove');
  }

  private sendAdd(id: string, data: T): void {
    const messageBytes = this.config.encode(data).finish();
    this.sendBuffer(id, SyncCollectionEvents.Add, messageBytes);
    this.incrementStat('SendAdd');
  }

  private sendBuffer(id: string, event: SyncCollectionEvents, bytes: Uint8Array, excludeClientId?: string) {
    this.storage.__sendBuffer(this.id, event, id, bytes, excludeClientId);
  }

  public remoteUpdate(id: string, bytes: Uint8Array, broadcast: boolean = false, excludeClientId?: string): void {
    this.incrementStat('ServerUpdate');
    if (this.config.saveData || this.subscribersCount.get('Update')! > 0) {
      const data = this.config.decode(bytes);
      const record = this.localUpdate(id, data);
      this.sendEvent('Update', 'Server', id, record);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Update, bytes, excludeClientId);
    }
  }

  public remoteRemove(id: string, broadcast: boolean = false, excludeClientId?: string): void {
    this.incrementStat('ServerRemove');
    if (this.config.saveData || this.subscribersCount.get('Remove')! > 0) {
      const record = this.collection.get(id)!;
      this.localRemove(id);
      this.sendEvent('Remove', 'Server', id, record);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Remove, new Uint8Array(), excludeClientId);
    }
  }

  public remoteAdd(id: string, bytes: Uint8Array, broadcast: boolean = false, excludeClientId?: string): void {
    this.incrementStat('ServerAdd');
    if (this.config.saveData || this.subscribersCount.get('Add')! > 0) {
      const data = this.config.decode(bytes);
      const record = this.localAdd(id, data);
      this.sendEvent('Add', 'Server', id, record);
    }
    if (broadcast) {
      this.sendBuffer(id, SyncCollectionEvents.Add, bytes, excludeClientId);
    }
  }

  public sendEvent(event: SyncCollectionEvent, from: FromUpdate, id: string, record: SyncCollectionRecord<T>): void {
    if (!this.config.localEvents && from === 'Client') {
      return;
    }
    this.subscribers.forEach(listener => {
      if (listener.event === event) {
        listener.callback(id, record, this, from);
      }
    });
  }

  private incrementStat(event: string): void {
    this.stat.set(event, this.stat.get(event)! + 1);
  }
}

function generateTransferId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i) * (i + 1);
  }
  return (hash % 100000000).toString(36);
}