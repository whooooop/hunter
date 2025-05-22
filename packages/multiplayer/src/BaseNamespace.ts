import { SyncCollection, SyncCollectionConfig } from "./Collection";
import { ExportCollectionMessage, Message, MessageType, SyncCollectionEvents, SyncCollectionMessage } from "./sync";
import { ClientId, CollectionId, NamespaceId } from "./types";

export interface BaseNamespaceConfig {
    collections: CollectionId[];
}

export function defineCollection<T extends object>(id: CollectionId, config: SyncCollectionConfig<T>): CollectionId {
    BaseNamespace.collectionRegistry.set(id, config as unknown as SyncCollectionConfig<object>);
    return id;
}

export class BaseNamespace {
    protected readonly createdAt = Date.now();
    protected readonly collections = new Map<CollectionId, SyncCollection<object>>();

    static readonly collectionRegistry = new Map<CollectionId, SyncCollectionConfig<object>>();

    constructor(
        public readonly id: NamespaceId,
        public readonly config: BaseNamespaceConfig,
    ) {
        this.config.collections.forEach((collectionId) => {
            const collectionConfig = BaseNamespace.collectionRegistry.get(collectionId)!;
            const collection = new SyncCollection<object>(collectionId, collectionConfig);
            this.collections.set(collectionId, collection);
            collection.__setOnSendBuffer(this.onSendBuffer.bind(this));
        });
    }

    protected broadcast(messageBytes: Uint8Array, excludeClientId?: ClientId) {}

    protected onSendBuffer(collectionId: CollectionId, event: SyncCollectionEvents, itemId: string, payload: Uint8Array, excludeClientId?: string) {
        console.log(`onSendBuffer`, collectionId, event, itemId);
        const collectionMessage = SyncCollectionMessage.encode({ collectionId, event, itemId, payload }).finish();
        const message = Message.encode({ type: MessageType.SyncCollectionEvent, timestamp: Date.now().toString(), payload: collectionMessage }).finish();
        this.broadcast(message, excludeClientId);
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

    public handleMessage(clientId: ClientId, payloadBytes: Uint8Array, broadcastRemoteMessages: boolean = false): void {
        try {
            const message = SyncCollectionMessage.decode(payloadBytes);
            console.log(`Received sync collection message: ${message.collectionId} ${message.event} ${message.itemId}`);
            const collection = this.getCollection(message.collectionId);

            if (!collection) {
                return;
            }

            if (message.event === SyncCollectionEvents.Add) {
              collection.remoteAdd(message.itemId, message.payload, broadcastRemoteMessages, clientId);
            } else if (message.event === SyncCollectionEvents.Update) {
              collection.remoteUpdate(message.itemId, message.payload, broadcastRemoteMessages, clientId);
            } else if (message.event === SyncCollectionEvents.Remove) {
              collection.remoteRemove(message.itemId, broadcastRemoteMessages, clientId);
            }

            console.log('message.collectionId', collection)
            
        } catch (error) {
            console.error(`Failed to decode sync collection message:`, error);
        }
    }

    public importCollection(payloadBytes: Uint8Array) {
        const message = ExportCollectionMessage.decode(payloadBytes);
        const collection = this.getCollection(message.collectionId);
        if (!collection) {
            console.error(`Collection ${message.collectionId} not found`);
            return;
        }
        collection.import(message.itemIds, message.payload);
    }

}
