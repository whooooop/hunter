import { SocketClient, SocketEvents, SocketReceivedEvents } from '../network/SocketClient';
import { emitEvent, onEvent } from "../Events";
import {
    PlayerSetWeaponEvent,
    WeaponPurchasedEvent,
    WaveStartEvent,
    SpawnEnemyEvent,
    EnemyDeathEvent,
    PlayerScoreUpdateEvent,
    PlayerJoined,
    WeaponFireActionEvent,
    PlayerStateEvent,
} from '../proto/generated/game';

import { WeaponPurchasedPayload, ShopEvents } from "../types/shopTypes";
import { Player } from "../types/playerTypes";
import { WaveStartEventPayload, WaveEvents, SpawnEnemyPayload } from "./WaveController";
import { Weapon } from "../types/weaponTypes";
import { EnemyDeathPayload, EnemyEntityEvents } from "../types/enemyTypes";
import { ScoreEvents, UpdateScoreEventPayload } from "../types/scoreTypes";
import { createLogger } from '../../../utils/logger';
import { GameplayScene } from '../../scenes/GameplayScene/GameplayScene';
import { PLAYER_POSITION_X } from '../Constants';
import { PLAYER_POSITION_Y } from '../Constants';

const logger = createLogger('MultiplayerController');
const SERVER_URL = 'ws://localhost:3000';

export class MultiplayerController {
  private scene: GameplayScene;
  private socketClient: SocketClient;

  constructor(scene: GameplayScene) {
    this.scene = scene;
    this.socketClient = new SocketClient();
  }

  public connect(gameId: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socketClient = new SocketClient();
      this.socketClient.connect(SERVER_URL, gameId, playerId)
        .then(() => {
            logger.info(`SocketClient connected to namespace /game/${gameId}.`);
            this.setupServerEventHandlers();
            this.setupLocalEventHandlers();
            resolve();
            // logger.info('Sending JoinGame...');
            // const joinRequest = JoinGame.create({ playerId });
            // this.socketClient.send(SocketSentEvents.JoinGame, joinRequest);
        })
        .catch((error: Error) => {
            logger.error('SocketClient connection failed:', error);
            reject(error);
        });

      this.socketClient.on('disconnect', () => {
          logger.warn('SocketClient disconnected.');
          reject();
      });

      this.socketClient.on('error', (error: any) => {
          logger.error('SocketClient connection error:', error);
      });
    })
  }

  // Обработчики локальных событий Phaser (отправка на сервер)
  private setupLocalEventHandlers(): void {
    onEvent(this.scene, Weapon.Events.FireAction.Local, this.clientHandleFire.bind(this));
    onEvent(this.scene, Player.Events.SetWeapon.Local, this.clientHandleSetWeapon.bind(this));
    onEvent(this.scene, Player.Events.State.Local, this.clientHandlePlayerState.bind(this));

    onEvent(this.scene, WaveEvents.WaveStartEvent, this.clientHandleWaveStart.bind(this));
    onEvent(this.scene, WaveEvents.SpawnEnemyEvent, this.clientHandleSpawnEnemy.bind(this));
    onEvent(this.scene, EnemyEntityEvents.enemyDeath, this.clientHandleEnemyDeath.bind(this));
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.clientHandleWeaponPurchased.bind(this));
    onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.clientHandleUpdateScore.bind(this));
  }

  private setupServerEventHandlers(): void {
    this.socketClient.on(SocketReceivedEvents.PlayerJoined, this.serverHandlePlayerJoined.bind(this));
    this.socketClient.on(SocketReceivedEvents.FireEvent, this.serverHandleFireEvent.bind(this));
    this.socketClient.on(SocketReceivedEvents.PlayerStateEvent, this.serverHandlePlayerState.bind(this));

    // this.socketClient.on(SocketReceivedEvents.WaveStart, this.serverHandleWaveStart.bind(this));
    // this.socketClient.on(SocketReceivedEvents.SpawnEnemy, this.serverHandleSpawnEnemy.bind(this));
    // this.socketClient.on(SocketReceivedEvents.EnemyDeath, this.serverHandleEnemyDeath.bind(this));
    // this.socketClient.on(SocketReceivedEvents.PlayerScoreUpdate, this.serverHandlePlayerScoreUpdate.bind(this));
    this.socketClient.on(SocketReceivedEvents.PlayerSetWeapon, this.serverHandlePlayerSetWeapon.bind(this));
    // this.socketClient.on(SocketReceivedEvents.WeaponPurchased, this.serverHandleWeaponPurchased.bind(this));
  }

  // Обработчики локальных событий

  private clientHandleFire(payload: Weapon.Events.FireAction.Payload): void {
    this.socketClient.send(SocketEvents.FireEvent, payload);
  }

  private clientHandlePlayerState(payload: Player.Events.State.Payload): void {
    this.socketClient.send(SocketEvents.PlayerStateEvent, payload);
  }

  private clientHandleWaveStart(payload: WaveStartEventPayload): void {
    this.socketClient.send(SocketEvents.WaveStart, payload);
  }

  private clientHandleSpawnEnemy(payload: SpawnEnemyPayload): void {
    this.socketClient.send(SocketEvents.SpawnEnemy, payload);
  }

  private clientHandleEnemyDeath(payload: EnemyDeathPayload): void {
    this.socketClient.send(SocketEvents.EnemyDeath, payload);
  }

  private clientHandleSetWeapon(payload: Player.Events.SetWeapon.Payload): void {
    logger.info(`Sending PlayerSetWeapon event to server:`, payload);
    this.socketClient.send(SocketEvents.PlayerSetWeapon, payload);
  }

  private clientHandleWeaponPurchased(payload: WeaponPurchasedPayload): void {
    this.socketClient.send(SocketEvents.WeaponPurchased, payload);
  }

  private clientHandleUpdateScore(payload: UpdateScoreEventPayload): void {
    this.socketClient.send(SocketEvents.PlayerScoreUpdate, payload);
  }

  // Обработчики серверных событий

  private serverHandlePlayerJoined(payload: PlayerJoined): void {
    logger.info(`Player ${payload.playerId} joined.`);
    this.scene.spawnPlayer(payload.playerId, PLAYER_POSITION_X, PLAYER_POSITION_Y + 200);
  }

  private serverHandlePlayerSetWeapon(payload: PlayerSetWeaponEvent): void {
    logger.info(`Player ${payload.playerId} set weapon to ${payload.weaponType}`);
    const data = payload as Player.Events.SetWeapon.Payload;
    emitEvent(this.scene, Player.Events.SetWeapon.Remote, data);
  }

  private serverHandlePlayerState(payload: PlayerStateEvent): void {
    // logger.info(`Player ${payload.playerId} state updated:`, payload);
    const data = payload as Player.Events.State.Payload;
    emitEvent(this.scene, Player.Events.State.Remote, data);
  }
  
  private serverHandleFireEvent(payload: WeaponFireActionEvent): void {
    logger.info('Received fire event from player:', payload);
    const data = payload as Weapon.Events.FireAction.Payload;
    emitEvent(this.scene, Weapon.Events.FireAction.Remote, data);
  }   

  private serverHandleWaveStart(payload: WaveStartEvent): void {
    logger.info(`Wave ${payload.number} started.`);
  }

  private serverHandleSpawnEnemy(payload: SpawnEnemyEvent): void {
    logger.info(`Spawning enemy`, payload);
  } 

  private serverHandleEnemyDeath(payload: EnemyDeathEvent): void {
    logger.info(`Enemy ${payload.id} died.`);
  }

  private serverHandlePlayerScoreUpdate(payload: PlayerScoreUpdateEvent): void {
    logger.info(`Player ${payload.playerId} score updated: ${payload.score}`);
  }

  private serverHandleWeaponPurchased(payload: WeaponPurchasedEvent): void {
    logger.info(`Player ${payload.playerId} purchased ${payload.weaponType}`);
  }

  public destroy(): void {
    this.socketClient.disconnect();

    this.scene.events.off(Weapon.Events.FireAction.Local, this.clientHandleFire, this);
    this.scene.events.off(Player.Events.SetWeapon.Local, this.clientHandleSetWeapon, this);

    this.scene.events.off(EnemyEntityEvents.enemyDeath, this.clientHandleEnemyDeath, this);
    this.scene.events.off(WaveEvents.WaveStartEvent, this.clientHandleWaveStart, this);
    this.scene.events.off(WaveEvents.SpawnEnemyEvent, this.clientHandleSpawnEnemy, this);
    this.scene.events.off(ShopEvents.WeaponPurchasedEvent, this.clientHandleWeaponPurchased, this);
    this.scene.events.off(ScoreEvents.UpdateScoreEvent, this.clientHandleUpdateScore, this);
  }
}