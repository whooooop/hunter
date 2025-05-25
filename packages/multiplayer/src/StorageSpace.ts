import { CollectionId, FromUpdate, SyncCollection, SyncCollectionEvent, SyncCollectionRecord } from "./Collection";
import { SyncCollectionEvents } from "./sync";

export type StorageSpaceId = string;

export interface StorageSpaceConfig {
  collections: CollectionId[];
}

export function defineStorageSpace(id: StorageSpaceId, config: StorageSpaceConfig): StorageSpaceId {
  StorageSpace.registry.set(id, config);
  return id;
}

export class StorageSpace {
  static readonly registry: Map<StorageSpaceId, StorageSpaceConfig> = new Map();
  protected readonly collections = new Map<CollectionId, SyncCollection<object>>();

  private __onSendBuffer: ((collectionId: string, event: SyncCollectionEvents, id: string, bytes: Uint8Array, excludeClientId?: string) => void) | null = null;

  constructor(
    private readonly id: StorageSpaceId,
    private readonly config: StorageSpaceConfig,
  ) {
    this.config.collections.forEach((collectionId) => {
      const collection = SyncCollection.create(collectionId, this);
      if (!collection) {
        throw new Error(`Collection ${collectionId} not found`);
      }
      this.collections.set(collectionId, collection);
    });
  }

  static create(id: StorageSpaceId): StorageSpace | null {
    const config = StorageSpace.registry.get(id);
    if (!config) {
      console.error(`StorageSpace ${id} not found`);
      return null;
    }
    return new StorageSpace(id, config);
  }

  public getCollection<T extends object>(collectionId: CollectionId): SyncCollection<T> | null {
    if (!this.collections.has(collectionId)) {
      console.error(`Collection ${collectionId} not found`);
      return null;
    }
    return this.collections.get(collectionId) as unknown as SyncCollection<T>;
  }

  public getCollectionSize<T extends object>(collectionId: CollectionId): number {
    const collection = this.getCollection(collectionId);
    if (!collection) {
      return 0;
    }
    return collection.getSize();
  }

  on<T extends object>(collectionId: CollectionId, event: SyncCollectionEvent, callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): this {
    const collection = this.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }
    // @ts-ignore
    collection.subscribe(event, callback);
    return this;
  }

  off<T extends object>(collectionId: CollectionId, event: SyncCollectionEvent, callback: (id: string, record: SyncCollectionRecord<T>, collection: SyncCollection<T>, from: FromUpdate) => void): this {
    const collection = this.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }
    // @ts-ignore
    collection.unsubscribe(event, callback);
    return this;
  }

  public importCollectionBytes(collectionId: CollectionId, ids: string[], payloadBytes: Uint8Array[]) {
    const collection = this.getCollection(collectionId);
    if (!collection) {
      return;
    }
    if (ids.length !== payloadBytes.length) {
      console.error(`Collection ${collectionId} has a different number of items than the payload`);
      return;
    }

    collection.import(ids, payloadBytes);
  }

  public __sendBuffer(collectionId: CollectionId, event: SyncCollectionEvents, id: string, bytes: Uint8Array, excludeClientId?: string) {
    this.__onSendBuffer?.(collectionId, event, id, bytes, excludeClientId);
  }

  public __setOnSendBuffer(onSendBuffer: (collectionId: string, event: SyncCollectionEvents, id: string, bytes: Uint8Array, excludeClientId?: string) => void): void {
    this.__onSendBuffer = onSendBuffer;
  }
}
