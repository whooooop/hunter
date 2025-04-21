import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { createLogger, LogLevel } from '../../../utils/logger';
import {
    JoinGame,
    WeaponFireActionEvent,
    PlayerSetWeaponEvent,
    WeaponPurchasedEvent,
    PlayerJoined,
    WaveStartEvent,
    SpawnEnemyEvent,
    EnemyDeathEvent,
    PlayerScoreUpdateEvent,
    PlayerStateEvent
} from '../proto/generated/game';

const logger = createLogger('SocketClient', {
  minLevel: LogLevel.DEBUG,
  enabled: true
});

export enum SocketEvents {
  JoinGame = 'JoinGame',
  PlayerJoined = 'PlayerJoinedEvent',
  // PlayerLeft = 'PlayerLeftEvent',
  FireEvent = 'FireEvent',
  WaveStart = 'WaveStartEvent',
  SpawnEnemy = 'SpawnEnemyEvent',
  EnemyDeath = 'EnemyDeathEvent',
  PlayerScoreUpdate = 'PlayerScoreUpdateEvent',
  PlayerSetWeapon = 'PlayerSetWeaponEvent',
  WeaponPurchased = 'WeaponPurchasedEvent',
  PlayerStateEvent = 'PlayerStateEvent',
}

interface SocketPayloadsMap {
    [SocketEvents.JoinGame]: JoinGame;
    [SocketEvents.PlayerJoined]: PlayerJoined;
    [SocketEvents.FireEvent]: WeaponFireActionEvent;
    [SocketEvents.PlayerSetWeapon]: PlayerSetWeaponEvent;
    [SocketEvents.WeaponPurchased]: WeaponPurchasedEvent;
    [SocketEvents.WaveStart]: WaveStartEvent;
    [SocketEvents.SpawnEnemy]: SpawnEnemyEvent;
    [SocketEvents.EnemyDeath]: EnemyDeathEvent;
    [SocketEvents.PlayerScoreUpdate]: PlayerScoreUpdateEvent;
    [SocketEvents.PlayerStateEvent]: PlayerStateEvent;
}

const encoders: {
  [K in SocketEvents]: (message: SocketPayloadsMap[K]) => Uint8Array;
} = {
    [SocketEvents.JoinGame]: (message: JoinGame) => JoinGame.encode(message).finish(),
    [SocketEvents.PlayerJoined]: (message: PlayerJoined) => PlayerJoined.encode(message).finish(),
    [SocketEvents.FireEvent]: (message: WeaponFireActionEvent) => WeaponFireActionEvent.encode(message).finish(),
    [SocketEvents.PlayerSetWeapon]: (message: PlayerSetWeaponEvent) => PlayerSetWeaponEvent.encode(message).finish(),
    [SocketEvents.WeaponPurchased]: (message: WeaponPurchasedEvent) => WeaponPurchasedEvent.encode(message).finish(),
    [SocketEvents.WaveStart]: (message: WaveStartEvent) => WaveStartEvent.encode(message).finish(),
    [SocketEvents.SpawnEnemy]: (message: SpawnEnemyEvent) => SpawnEnemyEvent.encode(message).finish(),
    [SocketEvents.EnemyDeath]: (message: EnemyDeathEvent) => EnemyDeathEvent.encode(message).finish(),
    [SocketEvents.PlayerScoreUpdate]: (message: PlayerScoreUpdateEvent) => PlayerScoreUpdateEvent.encode(message).finish(),
    [SocketEvents.PlayerStateEvent]: (message: PlayerStateEvent) => PlayerStateEvent.encode(message).finish(),
};

const decoders: {
  [K in SocketEvents]?: (data: Uint8Array) => SocketPayloadsMap[K];
} = {
  [SocketEvents.PlayerJoined]: (data) => PlayerJoined.decode(data),
  [SocketEvents.FireEvent]: (data) => WeaponFireActionEvent.decode(data),
  [SocketEvents.WaveStart]: (data) => WaveStartEvent.decode(data),
  [SocketEvents.SpawnEnemy]: (data) => SpawnEnemyEvent.decode(data),
  [SocketEvents.EnemyDeath]: (data) => EnemyDeathEvent.decode(data),
  [SocketEvents.PlayerScoreUpdate]: (data) => PlayerScoreUpdateEvent.decode(data),
  [SocketEvents.PlayerSetWeapon]: (data) => PlayerSetWeaponEvent.decode(data),
  [SocketEvents.PlayerStateEvent]: (data) => PlayerStateEvent.decode(data),
  [SocketEvents.WeaponPurchased]: (data) => WeaponPurchasedEvent.decode(data),
};

// Type for specific event handlers stored internally
type TypedEventHandler<E extends SocketEvents> = (data: SocketPayloadsMap[E]) => void;
// Type for generic (string-based) event handlers
type GenericEventHandler = (data?: any) => void;

// More precise type for the eventHandlers map
type EventHandlersMap = {
    [K in SocketEvents]?: TypedEventHandler<K>[];
} & {
    [key: string]: GenericEventHandler[]; // Allow other string keys for non-protobuf events
};

export class SocketClient extends EventEmitter {
    private socket: Socket | null = null;
    private _isConnected: boolean; // Use underscore to avoid conflict
    private eventHandlers: EventHandlersMap;

    constructor() {
        super();
        this._isConnected = false; // Initialize with underscore
        this.eventHandlers = {};
        logger.info('SocketClient instance created.');
    }

    public connect(baseUrl: string, gameId: string, playerId: string): Promise<void> {
        if (this._isConnected && this.socket) {
             logger.warn(`Already connected.`);
             return Promise.resolve();
         }
        if (this.socket) {
            logger.warn('Disconnecting existing socket before reconnecting.');
            this.socket.disconnect();
            this.socket = null;
        }

        return new Promise((resolve, reject) => {
          const url = `${baseUrl}/game/${gameId}`;
          logger.info(`Attempting socket.io connection to ${url}...`);

          this.socket = io(url, {
              transports: ['websocket'],
              query: {
                playerId
              }
          });

          this.socket.on('connect', () => {
              this._isConnected = true;
              logger.info(`Socket.io connected successfully. ID: ${this.socket?.id}`);
              this.setupDefaultListeners();
              this.emit('connect');
              resolve();
          });

          this.socket.on('connect_error', (error: Error) => {
              logger.error(`Socket.io connection error to ${url}: ${error.message}`);
              this._isConnected = false;
              this.socket?.disconnect();
              this.socket = null;
              this.emit('error', error);
              reject(error);
          });

          this.socket.on('disconnect', (reason: Socket.DisconnectReason) => {
              logger.warn(`Socket.io disconnected from ${url}. Reason: ${reason}`);
              this._isConnected = false;
              this.emit('disconnect', reason);
          });
        });
    }

    public disconnect(): void {
        if (this.socket) {
            logger.info(`Disconnecting socket...`);
            this.socket.disconnect();
            this.socket = null;
            this._isConnected = false;
        } else {
            logger.warn('Attempted to disconnect, but socket was not initialized.');
        }
    }

    // Public getter for connection status
    public get isConnected(): boolean {
        return this._isConnected && !!this.socket?.connected;
    }

    /**
     * Sends an event to the server.
     * @param event The event name (must be one of SocketSentEvents)
     * @param data The payload object matching the event type in SocketSentPayloadsMap
     */
    public send<E extends SocketEvents>(event: E, data: SocketPayloadsMap[E]): void {
        if (!this.isConnected || !this.socket) {
            logger.error(`Cannot send event '${event}', socket not connected.`);
            return;
        }

        const encode = encoders[event];

        if (encode) {
            try {
                const payloadBytes = encode(data);
                this.socket.emit(event, payloadBytes);
                logger.debug(`Sent event '${event}' with Protobuf payload:`, data);
            } catch (error: any) {
                logger.error(`Failed to encode Protobuf for event '${event}': ${error.message}`);
            }
        } else {
            logger.error(`No Protobuf encoder found for event: ${event}. Message not sent.`);
        }
    }

    private setupDefaultListeners(): void {
        if (!this.socket) return;
        this.socket.offAny(this.handleAnyMessage);
        this.socket.onAny(this.handleAnyMessage);
    }

    private handleAnyMessage = (eventName: string, ...args: any[]): void => {
        const rawData = args[0];
        this.handleMessage(eventName, rawData);
    }

    private handleMessage(eventName: string, rawData: any): void {
         if (['connect', 'connect_error', 'disconnect'].includes(eventName)) {
             return;
         }
        // logger.debug(`Received event '${eventName}' with data:`, rawData);

        const decoder = decoders[eventName as SocketEvents];
        let decodedPayload: any = rawData;

        if (decoder) {
            if (rawData instanceof ArrayBuffer || rawData instanceof Buffer) {
                 try {
                    const payloadBytes = new Uint8Array(rawData);
                    decodedPayload = decoder(payloadBytes);
                    logger.debug(`Decoded event '${eventName}' payload:`, decodedPayload);
                 } catch (error: any) {
                     logger.error(`Failed to decode Protobuf for event '${eventName}': ${error.message}`);
                     this.emit('error', `Failed to decode event ${eventName}`);
                     return;
                 }
            } else {
                 logger.error(`Expected binary data for Protobuf event '${eventName}', but received type ${typeof rawData}.`);
                 return;
            }
        } else {
             logger.error(`No Protobuf decoder found for event '${eventName}'. Handling raw data.`);
        }
        this._emit(eventName, decodedPayload);
    }

    // Internal emit function to handle dynamic event names
    private _emit(eventName: string, data: any): void {
        // Use type assertion to access potentially typed handlers
        const handlers = this.eventHandlers[eventName as keyof EventHandlersMap] || [];
        handlers.forEach(handler => {
            try {
                // We assume the handler stored matches the data type due to `on` method's typing
                handler(data);
            } catch (error: any) {
                console.error(`Error in handler for event ${eventName}: ${error.message}`);
            }
        });
    }

    /**
     * Registers a handler for a specific server event.
     * @param eventName The event name (must be one of SocketReceivedEvents)
     * @param handler The callback function, typed according to the event
     */
    public on<E extends SocketEvents>(eventName: E, handler: TypedEventHandler<E>): this;
    // Overload for generic string events (connect, disconnect, error, etc.)
    public on(eventName: string, handler: GenericEventHandler): this;
    // Implementation
    public on(eventName: string, handler: GenericEventHandler): this {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
         if (!this.eventHandlers[eventName].includes(handler)) {
            this.eventHandlers[eventName].push(handler);
            // logger.debug(`Registered handler for event '${eventName}'`);
        } else {
            logger.warn(`Handler already registered for event '${eventName}'`);
        }
        return this;
    }

    /**
     * Unregisters a handler for a specific server event.
     * @param eventName The event name (must be one of SocketReceivedEvents)
     * @param handler The reference to the handler function to remove
     */
    public off<E extends SocketEvents>(eventName: E, handler: TypedEventHandler<E>): this;
    // Overload for generic string events
    public off(eventName: string, handler: GenericEventHandler): this;
    // Implementation
    public off(eventName: string, handler: GenericEventHandler): this {
        const handlers = this.eventHandlers[eventName];
        if (handlers) {
            const index = handlers.findIndex(h => h === handler);
            if (index > -1) {
                handlers.splice(index, 1);
                logger.debug(`Unregistered handler for event '${eventName}'`);
                if (handlers.length === 0) {
                    delete this.eventHandlers[eventName];
                }
            }
        }
        return this;
    }
}