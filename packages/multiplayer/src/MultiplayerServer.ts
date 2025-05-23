import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from 'http';
import Stream from "stream";
import { parse } from "node:url";
import { Message, MessageType } from './sync'
import { ServerNamespace, ServerNamespaceConfig } from "./ServerNamespace";
import { ClientSocket } from "./ClientSocket";
import { ClientId, NamespaceId } from "./types";

interface Config<Session extends object = any> {
  pathname: string | RegExp;
  onConnection?: (server: MultiplayerServer<Session>, clientSocket: ClientSocket<Session>, namespace: string, request: IncomingMessage) => Promise<void>;
  onJoin?: (server: MultiplayerServer<Session>, clientSocket: ClientSocket<Session>) => Promise<void>;
  onDisconnect?: (server: MultiplayerServer<Session>, clientSocket: ClientSocket<Session>) => Promise<void>;
  generateClientId?: () => ClientId;
  namespace: ServerNamespaceConfig;
}

export class MultiplayerServer<Session extends object = any> {
  private wss: WebSocketServer;
  private sockets = new Map<ClientId, ClientSocket<Session>>();
  private clientNamespaceMap = new Map<ClientId, NamespaceId>();
  private namespaces = new Map<NamespaceId, ServerNamespace<Session>>();

  constructor(
    private readonly config: Config<Session>
  ) { 
    this.wss = new WebSocketServer({ noServer: true });
  }

  initializeWebSocketServer(httpServer: HttpServer) {
    console.log('WebSocket Server Attached to HTTP Server');
    httpServer.on('upgrade', (request: IncomingMessage, socket: Stream.Duplex, head: Buffer) => {
      this.wss.handleUpgrade(request, socket, head, async (ws: WebSocket) => {
        const { pathname, query } = parse(request.url || '', true); 
        const namespaceId = query?.namespace as string;

        if (!namespaceId) {
          socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\nNamespace not found.\r\n');
          socket.destroy();
          return;
        }

        const clientId = this.generateClientId();
        const clientSocket = new ClientSocket<Session>(clientId, this, ws, request);

        try {
          if (this.config.onConnection) {
            await this.config.onConnection(this, clientSocket, namespaceId, request);
          }
          await this.handleConnection(request, clientSocket, namespaceId);

          console.log(`Client ${clientSocket.id} connected to namespace ${clientSocket.namespace?.id}`);

          if (this.config.onJoin) {
            await this.config.onJoin(this, clientSocket);
          }
        } catch (error) {
          console.error(`Error handling connection for client ${clientId}: ${error}`);
          ws.close(1008, 'Connection error');
        }
      });
    });
  }

  public getNamespace(namespaceId: NamespaceId): ServerNamespace<Session> {
    if (!this.namespaces.has(namespaceId)) {
      const namespace = new ServerNamespace<Session>(this, namespaceId, this.config.namespace);
      this.namespaces.set(namespaceId, namespace);
      return namespace;
    }
    return this.namespaces.get(namespaceId)!;
  }

  private async handleConnection(request: IncomingMessage, clientSocket: ClientSocket<Session>, namespaceId: NamespaceId) {
    const namespace = this.getNamespace(namespaceId);
    
    namespace.connectClient(clientSocket);

    this.sockets.set(clientSocket.id, clientSocket);
    this.clientNamespaceMap.set(clientSocket.id, namespaceId);

    clientSocket.ws.on('message', (message: Buffer) => this.handleMessage(clientSocket.id, message));
    clientSocket.ws.on('close', (code, reason) => this.disconnect(clientSocket.id));
    clientSocket.ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientSocket.id}: ${error.message}`);
    });
  }

  private handleMessage(clientId: ClientId, messageBytes: Buffer) { 
    if (messageBytes.length < 1) {
      console.warn(`Received empty message from ${clientId}. Ignoring.`);
      return;
    }

    const messageData = Message.decode(messageBytes);
    if (messageData.type === MessageType.Ping) {
      this.send(clientId, messageBytes);
      return;
    }

    if (messageData.type === MessageType.SyncCollectionEvent) {
      const namespaceId = this.clientNamespaceMap.get(clientId)!;
      const namespace = this.namespaces.get(namespaceId)!;
      namespace.handleMessage(clientId, messageData.payload);
    } else {
      console.warn(`Received unknown message type from ${clientId}: ${messageData.type}`);
    }
  }

  public async disconnect(clientId: ClientId) {
    console.log(`Client ${clientId} disconnected.`);
    const clientSocket = this.sockets.get(clientId)!;

    if (this.config.onDisconnect) {
      try {
        await this.config.onDisconnect(this, clientSocket);
      } catch (error) {}
    }

    const namespaceId = this.clientNamespaceMap.get(clientId)!;
    const namespace = this.namespaces.get(namespaceId)!;

    namespace.disconnectClient(clientId);
    this.clientNamespaceMap.delete(clientId);
    this.sockets.delete(clientId);

    try {
      clientSocket.ws.close();
    } catch (error) {
      console.error(`Error closing WebSocket for client ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public send(clientId: string, bytes: Uint8Array) {
    const clientSocket = this.sockets.get(clientId);
    if (clientSocket && clientSocket.ws.readyState === WebSocket.OPEN) {
      clientSocket.ws.send(bytes);
    }
  }

  private generateClientId(): ClientId {
    if (typeof this.config.generateClientId === 'function') {
      return this.config.generateClientId();
    }
    return Math.random().toString(36).substring(2, 15);
  }
}
