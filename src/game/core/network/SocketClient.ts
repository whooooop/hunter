import { EventEmitter } from 'events';
import { createLogger, LogLevel } from '../../../utils/logger';
import {
  EventJoinGame,
  EventWeaponFireAction,
  EventPlayerSetWeapon,
  EventWeaponPurchased,
  EventPlayerJoined,
  EventWaveStart,
  EventSpawnEnemy,
  EventEnemyDeath,
  EventPlayerScoreUpdate,
  EventPlayerState,
  ProtoEventType,
  Event,
  EventPlayerLeft
} from '../proto/generated/game';

const logger = createLogger('WebSocketClient', {
  minLevel: LogLevel.DEBUG,
  enabled: true
});

interface SocketPayloadsMap {
    [ProtoEventType.JoinGame]: EventJoinGame;
    [ProtoEventType.PlayerJoined]: EventPlayerJoined;
    [ProtoEventType.PlayerLeft]: EventPlayerLeft;
    [ProtoEventType.WeaponFireAction]: EventWeaponFireAction;
    [ProtoEventType.PlayerSetWeapon]: EventPlayerSetWeapon;
    [ProtoEventType.WeaponPurchased]: EventWeaponPurchased;
    [ProtoEventType.WaveStart]: EventWaveStart;
    [ProtoEventType.SpawnEnemy]: EventSpawnEnemy;
    [ProtoEventType.EnemyDeath]: EventEnemyDeath;
    [ProtoEventType.PlayerScoreUpdate]: EventPlayerScoreUpdate;
    [ProtoEventType.PlayerStateEvent]: EventPlayerState;
}

type EventConfig<E extends keyof SocketPayloadsMap> = {
    encoder: (message: SocketPayloadsMap[E]) => Uint8Array;
    decoder?: (data: Uint8Array) => SocketPayloadsMap[E];
};

type EventConfigMap = {
    [E in keyof SocketPayloadsMap]: EventConfig<E>;
};

const eventConfigs: EventConfigMap = {
    [ProtoEventType.JoinGame]: {
        encoder: (message) => EventJoinGame.encode(message).finish(),
    },
    [ProtoEventType.PlayerJoined]: {
        encoder: (message) => EventPlayerJoined.encode(message).finish(),
        decoder: (data) => EventPlayerJoined.decode(data),
    },
    [ProtoEventType.PlayerLeft]: {
        encoder: (message) => EventPlayerLeft.encode(message).finish(),
        decoder: (data) => EventPlayerLeft.decode(data),
    },
    [ProtoEventType.WeaponFireAction]: {
        encoder: (message) => EventWeaponFireAction.encode(message).finish(),
        decoder: (data) => EventWeaponFireAction.decode(data),
    },
    [ProtoEventType.PlayerSetWeapon]: {
        encoder: (message) => EventPlayerSetWeapon.encode(message).finish(),
        decoder: (data) => EventPlayerSetWeapon.decode(data),
    },
    [ProtoEventType.WeaponPurchased]: {
        encoder: (message) => EventWeaponPurchased.encode(message).finish(),
        decoder: (data) => EventWeaponPurchased.decode(data),
    },
    [ProtoEventType.WaveStart]: {
        encoder: (message) => EventWaveStart.encode(message).finish(),
        decoder: (data) => EventWaveStart.decode(data),
    },
    [ProtoEventType.SpawnEnemy]: {
        encoder: (message) => EventSpawnEnemy.encode(message).finish(),
        decoder: (data) => EventSpawnEnemy.decode(data),
    },
    [ProtoEventType.EnemyDeath]: {
        encoder: (message) => EventEnemyDeath.encode(message).finish(),
        decoder: (data) => EventEnemyDeath.decode(data),
    },
    [ProtoEventType.PlayerScoreUpdate]: {
        encoder: (message) => EventPlayerScoreUpdate.encode(message).finish(),
        decoder: (data) => EventPlayerScoreUpdate.decode(data),
    },
    [ProtoEventType.PlayerStateEvent]: {
        encoder: (message) => EventPlayerState.encode(message).finish(),
        decoder: (data) => EventPlayerState.decode(data),
    },
};

type ProtoEventName = keyof typeof ProtoEventType;
type StandardEventName = 'connect' | 'disconnect' | 'error';
type ClientEventName = ProtoEventName | StandardEventName;

type GenericEventHandler = (data?: any) => void;

// Определяем payload для каждого СТРОКОВОГО имени события явно
type EventPayloadsByName = {
    JoinGame: EventJoinGame;
    PlayerJoined: EventPlayerJoined;
    PlayerLeft: EventPlayerLeft;
    WeaponFireAction: EventWeaponFireAction;
    PlayerSetWeapon: EventPlayerSetWeapon;
    WeaponPurchased: EventWeaponPurchased;
    WaveStart: EventWaveStart;
    SpawnEnemy: EventSpawnEnemy;
    EnemyDeath: EventEnemyDeath;
    PlayerScoreUpdate: EventPlayerScoreUpdate;
    PlayerStateEvent: EventPlayerState;
};

// Значения - массивы типизированных обработчиков
type TypedEventHandlersMap = {
    // Для событий Protobuf используем EventNameToPayloadMap
    [N in keyof EventPayloadsByName]?: ((payload: EventPayloadsByName[N]) => void)[];
} & {
    // Для стандартных событий
    [N in StandardEventName]?: GenericEventHandler[];
};

export class SocketClient extends EventEmitter {
    private websocket: WebSocket | null = null;
    private _isConnected: boolean;
    // Используем новый тип для внутреннего хранения
    private eventHandlers: TypedEventHandlersMap = {};
    private connectionPromise: Promise<void> | null = null;
    private connectionResolver: (() => void) | null = null;
    private connectionRejector: ((reason?: any) => void) | null = null;

    constructor() {
        super();
        this._isConnected = false;
        logger.info('WebSocketClient instance created.');
    }

    public connect(baseUrl: string, gameId: string, playerId: string): Promise<void> {
        if (this._isConnected && this.websocket?.readyState === WebSocket.OPEN) {
            logger.warn(`WebSocket already connected.`);
            return Promise.resolve();
        }
        if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
            logger.warn('Closing existing WebSocket before reconnecting.');
            this.websocket.onopen = null;
            this.websocket.onerror = null;
            this.websocket.onclose = null;
            this.websocket.onmessage = null;
            this.websocket.close();
            this.websocket = null;
            this._isConnected = false;
        }
        if (this.connectionPromise) {
            logger.warn('Connection attempt already in progress.');
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
          this.connectionResolver = resolve;
          this.connectionRejector = reject;

          const protocol = baseUrl.startsWith('https:') || baseUrl.startsWith('wss:') ? 'wss:' : 'ws:';
          const cleanBaseUrl = baseUrl.replace(/^(https?|wss?):\/\//, '');
          const url = `${protocol}//${cleanBaseUrl}/game/${gameId}?playerId=${playerId}`;
          logger.info(`Attempting WebSocket connection to ${url}...`);

          try {
              this.websocket = new WebSocket(url);
              this.websocket.binaryType = "arraybuffer";

              this.websocket.onopen = () => {
                  logger.info(`WebSocket connected successfully to ${url}.`);
                  this._isConnected = true;
                  this.emit('connect');
                  if (this.connectionResolver) this.connectionResolver();
                  this.resetConnectionPromiseStates();
              };

              this.websocket.onerror = (event) => {
                  const errorMsg = event instanceof ErrorEvent ? event.message : 'WebSocket connection error';
                  logger.error(`WebSocket connection error to ${url}: ${errorMsg}`, event);
                  this._isConnected = false;
                  if (this.connectionRejector) this.connectionRejector(new Error(errorMsg));
                  this.emit('error', event);
                  this.cleanupWebSocketResources();
                  this.resetConnectionPromiseStates();
              };

              this.websocket.onclose = (event) => {
                  logger.warn(`WebSocket disconnected from ${url}. Code: ${event.code}, Reason: '${event.reason}', WasClean: ${event.wasClean}`);
                  this._isConnected = false;
                  if (!event.wasClean && this.connectionRejector) {
                      this.connectionRejector(new Error(`WebSocket closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`));
                  }
                  this.emit('disconnect', event.reason || `Code: ${event.code}`);
                  this.cleanupWebSocketResources();
                  this.resetConnectionPromiseStates();
              };

              this.websocket.onmessage = this.handleMessage;

          } catch (error) {
              logger.error(`Failed to create WebSocket instance for ${url}:`, error);
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
            logger.info(`Closing WebSocket connection...`);
            this._isConnected = false;
            this.websocket.close(1000, "Client disconnected");
        } else if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
             logger.warn('Attempting to disconnect while WebSocket is connecting. Closing.');
             this._isConnected = false;
             this.websocket.close(1000, "Client disconnected during connection");
        } else {
            logger.warn('Attempted to disconnect, but WebSocket was not open or connecting.');
        }
        if(this.connectionRejector) {
            this.connectionRejector(new Error("Connection cancelled by disconnect()"));
        }
        this.resetConnectionPromiseStates();
        this.connectionPromise = null;
    }

    public get isConnected(): boolean {
        return this._isConnected && this.websocket?.readyState === WebSocket.OPEN;
    }

    public send<E extends keyof SocketPayloadsMap>(eventType: E, data: Omit<SocketPayloadsMap[E], 'eventType'>): void {
        if (!this.isConnected || !this.websocket) {
            logger.error(`Cannot send event '${ProtoEventType[eventType]}', WebSocket not connected.`);
            return;
        }

        const config = eventConfigs[eventType];

        if (config && config.encoder) {
            try {
                const fullPayload = {
                    ...data,
                    eventType: eventType
                } as SocketPayloadsMap[E];

                const payloadBytes = config.encoder(fullPayload);
                this.websocket.send(payloadBytes);
                logger.debug(`Sent event '${ProtoEventType[eventType]}' (${eventType}) with Protobuf payload:`, fullPayload);
            } catch (error: any) {
                logger.error(`Failed to encode/send Protobuf for event '${ProtoEventType[eventType]}': ${error.message}`);
            }
        } else {
            logger.error(`No Protobuf encoder found or configured for event type: ${ProtoEventType[eventType]} (${eventType}). Message not sent.`);
        }
    }

    private handleMessage = (event: MessageEvent): void => {
        if (!(event.data instanceof ArrayBuffer)) {
            logger.warn('Received non-ArrayBuffer message, ignoring:', event.data);
            return;
        }

        const buffer = event.data as ArrayBuffer;
        if (buffer.byteLength < 1) {
            logger.error('Received empty message (less than 1 byte), ignoring.');
            return;
        }

        const view = new Uint8Array(buffer);
        const e = Event.decode(view);
        const eventType = e.eventType

        if (!(eventType in eventConfigs) || !eventConfigs[eventType as keyof SocketPayloadsMap]?.decoder) {
             const eventNameGuess = ProtoEventType[eventType] || 'Unknown';
             logger.error(`Received message with invalid event type byte: ${eventType} ('${eventNameGuess}') or no decoder configured.`);
             return;
         }

        const safeEventType = eventType as keyof SocketPayloadsMap;

        const eventName = ProtoEventType[safeEventType] as ProtoEventName;
        const decoder = eventConfigs[safeEventType]!.decoder!;

        try {
            const decodedPayload = decoder(view);
            logger.debug(`Decoded event '${eventName}' (${safeEventType}) payload (size: ${view.byteLength}):`, decodedPayload);
            this._emit(eventName, decodedPayload);
        } catch (error: any) {
            logger.error(`Failed to decode Protobuf for event '${eventName}' (${safeEventType}): ${error.message}`, error);
            this.emit('error', new Error(`Failed to decode event ${eventName}`));
        }
    }

    private _emit(eventName: ClientEventName, data: any): void {
        const handlers = this.eventHandlers[eventName as keyof TypedEventHandlersMap];
        if (handlers && handlers.length > 0) {
             [...handlers].forEach(handler => {
                try {
                    (handler as GenericEventHandler)(data);
                } catch (error: any) {
                    console.error(`Error in handler for event ${eventName}: ${error.message}\n`, error.stack);
                }
            });
        }
    }

    /**
     * Registers a handler for a specific server event.
     * @param eventName The STRING name of the event
     * @param handler The callback function, correctly typed for the specific event
     */
    public on<N extends keyof EventPayloadsByName>(
        eventName: N,
        handler: (payload: EventPayloadsByName[N]) => void
    ): this;
    public on(eventName: StandardEventName, handler: GenericEventHandler): this;
    public on(eventName: ClientEventName, handler: Function): this {
        const key = eventName as keyof TypedEventHandlersMap;
        if (!this.eventHandlers[key]) {
            this.eventHandlers[key] = [];
        }
        const handlersList = this.eventHandlers[key] as Function[] | undefined;
        if (handlersList && !handlersList.includes(handler)) {
             handlersList.push(handler);
        } else if (handlersList) {
             logger.warn(`Handler already registered for event '${key}'`);
        }
        super.on(eventName, handler as GenericEventHandler);
        return this;
    }

    /**
     * Unregisters a handler for a specific server event.
     * @param eventName The STRING name of the event
     * @param handler The reference to the handler function to remove
     */
     public off<N extends keyof EventPayloadsByName>(
         eventName: N,
         handler: (payload: EventPayloadsByName[N]) => void
     ): this;
     public off(eventName: StandardEventName, handler: GenericEventHandler): this;
     public off(eventName: ClientEventName, handler: Function): this {
        const key = eventName as keyof TypedEventHandlersMap;
        const handlers = this.eventHandlers[key] as Function[] | undefined;
        if (handlers) {
            const index = handlers.findIndex(h => h === handler);
            if (index > -1) {
                handlers.splice(index, 1);
                if (handlers.length === 0) {
                    delete this.eventHandlers[key];
                }
            }
        }
         super.off(eventName, handler as GenericEventHandler);
        return this;
    }
}