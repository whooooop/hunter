import { MultiplayerServer } from "./MultiplayerServer";
import { ServerNamespace } from "./ServerNamespace";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { SyncCollection } from "./Collection";
import { ClientId } from "./types";

export class ClientSocket<SessionData extends object> {
    public namespace: ServerNamespace<SessionData> | null = null;
    public session: SessionData = {} as SessionData;

    constructor(
        public readonly id: ClientId,
        public readonly server: MultiplayerServer,
        public readonly ws: WebSocket,
        public readonly request: IncomingMessage,
    ) {}

    send(bytes: Uint8Array) {
        this.server.broadcast(this.id, bytes);
    }

    async disconnect() {
        await this.server.disconnect(this.id);
    }

    getCollection<T extends object>(collectionId: string): SyncCollection<T> | null {
        return this.namespace?.getCollection<T>(collectionId) ?? null;
    }
}
