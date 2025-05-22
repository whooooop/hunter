import { BaseNamespace, BaseNamespaceConfig } from "./BaseNamespace";
import { ClientSocket } from "./ClientSocket";
import { MultiplayerServer } from "./MultiplayerServer";
import { ExportCollectionMessage, Message, MessageType } from "./sync";
import { ClientId, CollectionId, NamespaceId } from "./types";

export interface ServerNamespaceConfig extends BaseNamespaceConfig {
    timeout: number;
}

export class ServerNamespace<SessionData extends object> extends BaseNamespace {
    private lastMessageTime = 0;
    private readonly sockets = new Map<ClientId, ClientSocket<SessionData>>();
    
    constructor(
        public readonly server: MultiplayerServer,
        public readonly id: NamespaceId,
        public readonly config: ServerNamespaceConfig
    ) {
        super(id, config);
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

    public getConnectionsSize() {
        return this.sockets.size;
    }

    public getConnections() {
        return Array.from(this.sockets.values());
    }

    public handleMessage(clientId: ClientId, payloadBytes: Uint8Array, broadcastRemoteMessages: boolean = false) {
        this.lastMessageTime = Date.now();
        super.handleMessage(clientId, payloadBytes, true);
    }

    public broadcastCollection(clientId: ClientId, collectionId: CollectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection) {
            return;
        }
        const exportMessage = ExportCollectionMessage.encode({ 
            collectionId, 
            itemIds: collection.getIds(), 
            payload: collection.encodeAll() 
        }).finish();
        const message = Message.encode({ type: MessageType.ExportCollectionEvent, timestamp: Date.now().toString(), payload: exportMessage }).finish();
        this.server.broadcast(clientId, message);
    }

    protected broadcast(messageBytes: Uint8Array, excludeClientId?: ClientId) {
        this.sockets.forEach((clientSocket) => {
            if (!excludeClientId || clientSocket.id !== excludeClientId) {
                this.server.broadcast(clientSocket.id, messageBytes);
            }
        });
    }
}
