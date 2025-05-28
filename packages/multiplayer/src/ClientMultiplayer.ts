import { ClientNamespace } from "./ClientNamespace";
import { messageCounter, registry } from "./metrics";
import { StorageSpace } from "./StorageSpace";
import { BatchMessage, Message, MessageType } from "./sync";
import { NamespaceId } from "./types";

interface ClientMultiplayerConfig {
  baseUrl: string;
  storage: StorageSpace;
}

export class ClientMultiplayer {
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolver: (() => void) | null = null;
  private connectionRejector: ((reason?: any) => void) | null = null;

  private pingInterval: NodeJS.Timeout | null = null;
  private pingTime: number = 3000;
  private pingSendTime: number = 0;
  private pingPending: boolean = false;
  public ping: number = 0;

  private namespace!: ClientNamespace;

  public readonly metricsRegistry = registry;

  constructor(
    protected readonly config: ClientMultiplayerConfig
  ) { }

  public get connected(): boolean {
    return this.isConnected && this.websocket?.readyState === WebSocket.OPEN;
  }

  public connect(namespaceId: NamespaceId, playerId: string): Promise<void> {
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
      const url = `${protocol}//${cleanHost}/game?namespace=${namespaceId}&playerId=${playerId}`;

      this.namespace = new ClientNamespace(this, namespaceId, this.config.storage);

      try {
        this.websocket = new WebSocket(url);
        this.websocket.binaryType = "arraybuffer";

        this.websocket.onopen = () => {
          this.isConnected = true;
          // this.emit('connect');
          if (this.connectionResolver) this.connectionResolver();
          this.resetConnectionPromiseStates();

          this.pingInterval = setInterval(() => {
            if (Date.now() - this.pingSendTime > 15000) this.pingPending = false;
            if (this.pingPending) return;
            this.pingSendTime = Date.now();
            this.pingPending = true;
            this.send(Message.encode({ type: MessageType.Ping, timestamp: '', payload: new Uint8Array() }).finish());
          }, this.pingTime);
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
          clearInterval(this.pingInterval!);
        };

        this.websocket.onmessage = (event: MessageEvent) => {
          messageCounter.inc({ direction: 'receive' });

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
          this.handleMessage(messageBytes);
        }
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

  private handleMessage(messageBytes: Uint8Array): void {
    const messageData = Message.decode(messageBytes);

    if (messageData.type === MessageType.Ping) {
      this.ping = Date.now() - this.pingSendTime;
      this.pingPending = false;
      return;
    }

    if (messageData.type === MessageType.Batch) {
      const batchMessage = BatchMessage.decode(messageData.payload);
      batchMessage.messages.forEach((messageBytes) => {
        this.handleMessage(messageBytes);
      });
      return;
    }

    if (messageData.type === MessageType.SyncCollectionEvent) {
      this.namespace.handleMessage('', messageData.payload);
    } else if (messageData.type === MessageType.ExportCollectionEvent) {
      this.namespace.importCollection(messageData.payload);
    } else {
      console.error('Received unknown message type:', messageData.type);
    }
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
    if (this.connectionRejector) {
      this.connectionRejector(new Error("Connection cancelled by disconnect()"));
    }
    this.resetConnectionPromiseStates();
    this.connectionPromise = null;
  }

  public send(messageBytes: Uint8Array): void {
    if (this.websocket) {
      this.websocket.send(messageBytes);
      messageCounter.inc({ direction: 'send' });
    } else {
      console.error('WebSocket is not connected');
    }
  }

}