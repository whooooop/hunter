import { SocketClient, SocketSentEvents, SocketReceivedEvents } from '../network/SocketClient';
import { emitEvent, onEvent } from "../Events";
import {
    JoinGame,
    FireEvent,
    PlayerSetWeaponEvent,
    WeaponPurchasedEvent,
    WaveStartEvent,
    SpawnEnemyEvent,
    EnemyDeathEvent,
    PlayerScoreUpdateEvent,
    Point,
    PlayerJoined,
} from '../proto/generated/game';

import { WeaponPurchasedPayload, ShopEvents } from "../types/shopTypes";
import { PlayerSetWeaponEventPayload, PlayerEvents } from "../types/playerTypes";
import { WaveStartEventPayload, WaveEvents, SpawnEnemyPayload } from "./WaveController";
import { WeaponFireEventsPayload, WeaponEvents } from "../types/weaponTypes";
import { EnemyDeathPayload, EnemyEntityEvents } from "../types/enemyTypes";
import { ScoreEvents, UpdateScoreEventPayload } from "../types/scoreTypes";
import { createLogger } from '../../../utils/logger';

const logger = createLogger('MultiplayerController');
const SERVER_URL = 'ws://localhost:3000';

export class MultiplayerController {
  private scene: Phaser.Scene;
  private socketClient: SocketClient;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.socketClient = new SocketClient();
  }

  public connect(gameId: string, playerId: string): void {
    this.socketClient = new SocketClient();
    this.socketClient.connect(SERVER_URL, gameId)
      .then(() => {
          logger.info(`SocketClient connected to namespace /game/${gameId}.`);
          this.setupServerEventHandlers();
          this.setupLocalEventHandlers();

          logger.info('Sending JoinGame...');
          const joinRequest = JoinGame.create({ gameId, playerId });
          this.socketClient.send(SocketSentEvents.JoinGame, joinRequest);
      })
      .catch((error: Error) => {
          logger.error('SocketClient connection failed:', error);
      });

    this.socketClient.on('disconnect', () => {
        logger.warn('SocketClient disconnected.');
    });

    // this.socketClient.on('error', (error: any) => {
    //     logger.error('SocketClient connection error:', error);
    // });
  }

  // Обработчики локальных событий Phaser (отправка на сервер)
  private setupLocalEventHandlers(): void {
    onEvent(this.scene, WeaponEvents.FireEvent, this.handleFire, this);
    onEvent(this.scene, WaveEvents.WaveStartEvent, this.handleWaveStart, this);
    onEvent(this.scene, WaveEvents.SpawnEnemyEvent, this.handleSpawnEnemy, this);
    onEvent(this.scene, EnemyEntityEvents.enemyDeath, this.handleEnemyDeath, this);
    onEvent(this.scene, PlayerEvents.PlayerSetWeaponEvent, this.handleSetWeapon, this);
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.handleUpdateScore, this);
  }

  private setupServerEventHandlers(): void {
    this.socketClient.on(SocketReceivedEvents.PlayerJoined, (data: PlayerJoined) => {
        logger.info(`Player ${data.playerId} joined.`);
    });

    this.socketClient.on(SocketReceivedEvents.FireEvent, (data: FireEvent) => {
      logger.info('Received fire event from player:', data);
    });

    this.socketClient.on(SocketReceivedEvents.WaveStart, (data: WaveStartEvent) => {
      logger.info(`Wave ${data.number} started.`);
    });

    this.socketClient.on(SocketReceivedEvents.SpawnEnemy, (data: SpawnEnemyEvent) => {
      logger.info(`Spawning enemy`, data);
    });

    this.socketClient.on(SocketReceivedEvents.EnemyDeath, (data: EnemyDeathEvent) => {
      logger.info(`Enemy ${data.id} died.`);
    });

    this.socketClient.on(SocketReceivedEvents.PlayerScoreUpdate, (data: PlayerScoreUpdateEvent) => {
      logger.info(`Player ${data.playerId} score updated: ${data.score}`);
    });

    this.socketClient.on(SocketReceivedEvents.PlayerSetWeapon, (data: PlayerSetWeaponEvent) => {
      logger.info(`Player ${data.playerId} set weapon to ${data.weaponType}`);
    });

    this.socketClient.on(SocketReceivedEvents.WeaponPurchased, (data: WeaponPurchasedEvent) => {
      logger.info(`Player ${data.playerId} purchased ${data.weaponType}`);
    });

    logger.info('Server event handlers configured.');
  }

  private handleFire(payload: WeaponFireEventsPayload): void {
    this.socketClient.send(SocketSentEvents.FireEvent, payload);
  }

  private handleWaveStart(payload: WaveStartEventPayload): void {
    this.socketClient.send(SocketSentEvents.WaveStart, payload);
  }

  private handleSpawnEnemy(payload: SpawnEnemyPayload): void {
    this.socketClient.send(SocketSentEvents.SpawnEnemy, payload);
  }
  private handleEnemyDeath(payload: EnemyDeathPayload): void {
    this.socketClient.send(SocketSentEvents.EnemyDeath, payload);
  }

  private handleSetWeapon(payload: PlayerSetWeaponEventPayload): void {
     this.socketClient.send(SocketSentEvents.PlayerSetWeapon, payload);
  }

  private handleWeaponPurchased(payload: WeaponPurchasedPayload): void {
    this.socketClient.send(SocketSentEvents.WeaponPurchased, payload);
  }

  private handleUpdateScore(payload: UpdateScoreEventPayload): void {
    this.socketClient.send(SocketSentEvents.PlayerScoreUpdate, payload);
  }

  public destroy(): void {
    // this.socketClient.disconnect();

    this.scene.events.off(WeaponEvents.FireEvent, this.handleFire, this);
    this.scene.events.off(EnemyEntityEvents.enemyDeath, this.handleEnemyDeath, this);
    this.scene.events.off(PlayerEvents.PlayerSetWeaponEvent, this.handleSetWeapon, this);
    this.scene.events.off(WaveEvents.WaveStartEvent, this.handleWaveStart, this);
    this.scene.events.off(WaveEvents.SpawnEnemyEvent, this.handleSpawnEnemy, this);
    this.scene.events.off(ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    this.scene.events.off(ScoreEvents.UpdateScoreEvent, this.handleUpdateScore, this);
  }
}