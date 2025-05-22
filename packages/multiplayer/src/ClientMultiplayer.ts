import { ClientNamespace, ClientNamespaceConfig } from "./ClientNamespace";
import { SyncCollection } from "./Collection";
import { Message, MessageType, SyncCollectionEvents, SyncCollectionMessage } from "./sync";

interface ClientMultiplayerConfig {
  baseUrl: string;
  namespace: ClientNamespaceConfig;
}

export class ClientMultiplayer {
  private collections: Map<string, SyncCollection<any>> = new Map();
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolver: (() => void) | null = null;
  private connectionRejector: ((reason?: any) => void) | null = null;

  private namespace!: ClientNamespace;

  constructor(
    public readonly config: ClientMultiplayerConfig
  ) {}

  public get connected(): boolean {
    return this.isConnected && this.websocket?.readyState === WebSocket.OPEN;
  }

  public connect(namespace: string, playerId: string): Promise<void> {
    if (this.isConnected && this.websocket?.readyState === WebSocket.OPEN) {
      console.warn(`WebSocket already connected.`);
      return Promise.resolve();
    }

    if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
      console.warn('Closing existing WebSocket before reconnecting.');
      this.websocket.onopen = null;
      this.websocket.onerror = null;
      this.websocket.onclose = null;
      this.websocket.onmessage = null;
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }

    if (this.connectionPromise) {
      console.warn('Connection attempt already in progress.');
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionResolver = resolve;
      this.connectionRejector = reject;

      const protocol = this.config.baseUrl.startsWith('https:') || this.config.baseUrl.startsWith('wss:') ? 'wss:' : 'ws:';
      const cleanHost = this.config.baseUrl.replace(/^(https?|wss?):\/\//, '');
      const url = `${protocol}//${cleanHost}/game?namespace=${namespace}&playerId=${playerId}`;

      this.namespace = new ClientNamespace(this, namespace, this.config.namespace);

      try {
        this.websocket = new WebSocket(url);
        this.websocket.binaryType = "arraybuffer";

        this.websocket.onopen = () => {
          this.isConnected = true;
          // this.emit('connect');
          if (this.connectionResolver) this.connectionResolver();
          this.resetConnectionPromiseStates();
        };

        this.websocket.onerror = (event) => {
          const errorMsg = event instanceof ErrorEvent ? event.message : 'WebSocket connection error';
          console.error(`WebSocket connection error to ${url}: ${errorMsg}`, event);
          this.isConnected = false;
          if (this.connectionRejector) this.connectionRejector(new Error(errorMsg));
          // this.emit('error', event);
          this.cleanupWebSocketResources();
          this.resetConnectionPromiseStates();
        };

        this.websocket.onclose = (event) => {
          console.warn(`WebSocket disconnected from ${url}. Code: ${event.code}, Reason: '${event.reason}', WasClean: ${event.wasClean}`);
          this.isConnected = false;
          if (!event.wasClean && this.connectionRejector) {
              this.connectionRejector(new Error(`WebSocket closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`));
          }
          // this.emit('disconnect', event.reason || `Code: ${event.code}`);
          this.cleanupWebSocketResources();
          this.resetConnectionPromiseStates();
        };

        this.websocket.onmessage = (event: MessageEvent): void => {
          if (!(event.data instanceof ArrayBuffer)) {
              console.warn('Received non-ArrayBuffer message, ignoring:', event.data);
              return;
          }
      
          const buffer = event.data as ArrayBuffer;
          if (buffer.byteLength < 1) {
            console.error('Received empty message (less than 1 byte), ignoring.');
            return;
          }
      
          const messageBytes = new Uint8Array(buffer);
          const messageData = Message.decode(messageBytes);
      
          if (messageData.type === MessageType.SyncCollectionEvent) {
            this.namespace.handleMessage('', messageData.payload);
          } else if (messageData.type === MessageType.ExportCollectionEvent) {
            this.namespace.importCollection(messageData.payload);
          } else {
            console.error('Received unknown message type:', messageData.type);
          }
        };
      } catch (error) {
        console.error(`Failed to create WebSocket instance for ${url}:`, error);
        if (this.connectionRejector) this.connectionRejector(error);
          this.resetConnectionPromiseStates();
        }
    });

    const promiseToReturn = this.connectionPromise;
    this.connectionPromise.finally(() => {
        if (this.connectionPromise === promiseToReturn) {
             this.connectionPromise = null;
        }
    });

    return promiseToReturn;
  }

  private resetConnectionPromiseStates() {
    this.connectionResolver = null;
    this.connectionRejector = null;
  }

  private cleanupWebSocketResources() {
    if (this.websocket) {
      this.websocket.onopen = null;
      this.websocket.onerror = null;
      this.websocket.onclose = null;
      this.websocket.onmessage = null;
      this.websocket = null;
     }
  }

  public disconnect(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.info(`Closing WebSocket connection...`);
      this.isConnected = false;
      this.websocket.close(1000, "Client disconnected");
    } else if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
      console.warn('Attempting to disconnect while WebSocket is connecting. Closing.');
      this.isConnected = false;
      this.websocket.close(1000, "Client disconnected during connection");
    } else {
      console.warn('Attempted to disconnect, but WebSocket was not open or connecting.');
    }
    if(this.connectionRejector) {
      this.connectionRejector(new Error("Connection cancelled by disconnect()"));
    }
    this.resetConnectionPromiseStates();
    this.connectionPromise = null;
  }

  private handleSyncCollectionMessage(payloadBytes: Uint8Array): void {
    try {
      const message = SyncCollectionMessage.decode(payloadBytes);
      const collection = this.collections.get(message.collectionId);

      if (!collection) {
        console.error(`Received message for unknown collection: ${message.collectionId}`);
        return;
      }

      if (message.event === SyncCollectionEvents.Add) {
        collection.remoteAdd(message.itemId, message.payload);
      } else if (message.event === SyncCollectionEvents.Update) {
        collection.remoteUpdate(message.itemId, message.payload);
      } else if (message.event === SyncCollectionEvents.Remove) {
        collection.remoteRemove(message.itemId);
      }
    } catch (error) {
      console.error(`Failed to decode sync collection message:`, error);
    }
  }

  public send(messageBytes: Uint8Array): void {
    if (this.websocket) {
      this.websocket.send(messageBytes);
    } else {
      console.error('WebSocket is not connected');
    }
  }

}