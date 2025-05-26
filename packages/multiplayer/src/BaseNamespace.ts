import { CollectionId, SyncCollection } from "./Collection";
import { StorageSpace } from "./StorageSpace";
import { ExportCollectionMessage, Message, MessageType, SyncCollectionEvents, SyncCollectionMessage } from "./sync";
import { ClientId, NamespaceId } from "./types";

export interface BaseNamespaceConfig { }

export class BaseNamespace {
  protected readonly createdAt = Date.now();

  constructor(
    public readonly id: NamespaceId,
    protected readonly storage: StorageSpace,
    protected readonly config: BaseNamespaceConfig,
  ) {
    this.storage.__setOnSendBuffer(this.onSendBuffer.bind(this));
  }

  protected broadcast(messageBytes: Uint8Array, excludeClientId?: ClientId) { }

  protected onSendBuffer(collectionId: CollectionId, event: SyncCollectionEvents, itemId: string, payload: Uint8Array, excludeClientId?: string) {
    const collectionMessage = SyncCollectionMessage.encode({ collectionId, event, itemId, payload }).finish();
    const message = Message.encode({ type: MessageType.SyncCollectionEvent, timestamp: Date.now().toString(), payload: collectionMessage }).finish();
    this.broadcast(message, excludeClientId);
  }

  public getCollection<T extends object>(collectionId: CollectionId): SyncCollection<T> | null {
    return this.storage.getCollection(collectionId);
  }

  public getCollectionSize<T extends object>(collectionId: CollectionId): number {
    return this.storage.getCollectionSize(collectionId);
  }

  public importCollection(payloadBytes: Uint8Array) {
    const message = ExportCollectionMessage.decode(payloadBytes);
    this.storage.importCollectionBytes(message.collectionId, message.itemIds, message.payload);
  }

  public handleMessage(clientId: ClientId, payloadBytes: Uint8Array, broadcastRemoteMessages: boolean = false): void {
    try {
      const message = SyncCollectionMessage.decode(payloadBytes);
      // console.log(`Received sync collection message: ${message.collectionId} ${message.event} ${message.itemId}`);
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
    } catch (error) {
      console.error(`Failed to decode sync collection message:`, error);
    }
  }

}
