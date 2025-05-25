import { BaseNamespace, BaseNamespaceConfig } from "./BaseNamespace";
import { ClientSocket } from "./ClientSocket";
import { CollectionId } from "./Collection";
import { MultiplayerServer } from "./MultiplayerServer";
import { StorageSpace, StorageSpaceId } from "./StorageSpace";
import { BatchMessage, ExportCollectionMessage, Message, MessageType } from "./sync";
import { ClientId, NamespaceId } from "./types";

export interface ServerNamespaceConfig extends BaseNamespaceConfig {
  timeout: number;
  storageId: StorageSpaceId;
}

export class ServerNamespace<SessionData extends object> extends BaseNamespace {
  private lastMessageTime = 0;
  private readonly sockets = new Map<ClientId, ClientSocket<SessionData>>();

  constructor(
    public readonly server: MultiplayerServer,
    public readonly id: NamespaceId,
    protected readonly config: ServerNamespaceConfig
  ) {
    const storage = StorageSpace.create(config.storageId);
    if (!storage) {
      throw new Error(`Storage ${config.storageId} not found`);
    }
    super(id, storage, config);
  }

  public connectClient(clientSocket: ClientSocket<SessionData>) {
    this.sockets.set(clientSocket.id, clientSocket);
    clientSocket.namespace = this;
    this.lastMessageTime = Date.now();
  }

  public disconnectClient(clientId: ClientId) {
    const clientSocket = this.sockets.get(clientId);
    if (clientSocket) {
      clientSocket.namespace = null;
    }
    this.sockets.delete(clientId);
    this.lastMessageTime = Date.now();
  }

  public getConnectionsSize(): number {
    return this.sockets.size;
  }

  public getConnections(): ClientSocket<SessionData>[] {
    return Array.from(this.sockets.values());
  }

  public handleMessage(clientId: ClientId, payloadBytes: Uint8Array, broadcastRemoteMessages: boolean = false) {
    this.lastMessageTime = Date.now();
    super.handleMessage(clientId, payloadBytes, true);
  }

  public sendCollections(clientId: ClientId, collectionIds: CollectionId[]) {
    const messages: Uint8Array[] = collectionIds.map((collectionId) => {
      const collection = this.getCollection(collectionId);
      if (!collection) {
        throw new Error(`Collection ${collectionId} not found`);
      }
      const exportMessage = ExportCollectionMessage.encode({
        collectionId,
        itemIds: collection.getIds(),
        payload: collection.encodeAll()
      }).finish();
      return Message.encode({ type: MessageType.ExportCollectionEvent, timestamp: Date.now().toString(), payload: exportMessage }).finish();
    });

    const batchMessage = BatchMessage.encode({ type: MessageType.Batch, messages }).finish();
    const message = Message.encode({ type: MessageType.Batch, timestamp: Date.now().toString(), payload: batchMessage }).finish();
    this.server.send(clientId, message);
  }

  protected broadcast(messageBytes: Uint8Array, excludeClientId?: ClientId) {
    this.sockets.forEach((clientSocket) => {
      if (!excludeClientId || clientSocket.id !== excludeClientId) {
        this.server.send(clientSocket.id, messageBytes);
      }
    });
  }
}
