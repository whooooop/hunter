import { SocketClient } from '../network/SocketClient';
import { emitEvent, onEvent } from "../Events";
import { EventPlayerJoined, EventPlayerSetWeapon, EventWeaponFireAction, EventWaveStart, EventSpawnEnemy, EventEnemyDeath, EventPlayerScoreUpdate, ProtoEventType, EventWeaponPurchased, EventPlayerLeft, EventGameState, EventPlayerPosition } from '../proto/generated/game';
import { WeaponPurchasedPayload, ShopEvents } from "../types/shopTypes";
import { Player } from "../types/playerTypes";
import { WaveStartEventPayload, WaveEvents, SpawnEnemyPayload } from "./WaveController";
import { Weapon } from "../types/weaponTypes";
import { EnemyDeathPayload, EnemyEntityEvents } from "../types/enemyTypes";
import { ScoreEvents, UpdateScoreEventPayload } from "../types/scoreTypes";
import { createLogger } from '../../../utils/logger';
import { GameplayScene } from '../../scenes/GameplayScene/GameplayScene';
import { Game } from '../types/gameTypes';

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
    this.socketClient.on('GameState', this.serverHandleGameState.bind(this));
    this.socketClient.on('PlayerJoined', this.serverHandlePlayerJoined.bind(this));
    this.socketClient.on('PlayerLeft', this.serverHandlePlayerLeft.bind(this));
    this.socketClient.on('PlayerSetWeapon', this.serverHandlePlayerSetWeapon.bind(this));
    this.socketClient.on('PlayerPosition', this.serverHandlePlayerPosition.bind(this));

    this.socketClient.on('WeaponFireAction', this.serverHandleFireEvent.bind(this));
    // this.socketClient.on(SocketEvents.WaveStart, this.serverHandleWaveStart.bind(this));
    // this.socketClient.on(SocketEvents.SpawnEnemy, this.serverHandleSpawnEnemy.bind(this));
    // this.socketClient.on(SocketEvents.EnemyDeath, this.serverHandleEnemyDeath.bind(this));
    // this.socketClient.on(SocketEvents.PlayerScoreUpdate, this.serverHandlePlayerScoreUpdate.bind(this));
    // this.socketClient.on('WeaponPurchased', this.serverHandleWeaponPurchased.bind(this));
  }

  // Обработчики локальных событий

  private clientHandleFire(payload: Weapon.Events.FireAction.Payload): void {
    this.socketClient.send(ProtoEventType.WeaponFireAction, payload);
  }

  private clientHandlePlayerState(payload: Player.Events.State.Payload): void {
    this.socketClient.send(ProtoEventType.PlayerPosition, payload);
  }

  private clientHandleWaveStart(payload: WaveStartEventPayload): void {
    this.socketClient.send(ProtoEventType.WaveStart, payload);
  }

  private clientHandleSpawnEnemy(payload: SpawnEnemyPayload): void {
    this.socketClient.send(ProtoEventType.SpawnEnemy, payload);
  }

  private clientHandleEnemyDeath(payload: EnemyDeathPayload): void {
    this.socketClient.send(ProtoEventType.EnemyDeath, payload);
  }

  private clientHandleSetWeapon(payload: Player.Events.SetWeapon.Payload): void {
    logger.info(`Sending PlayerSetWeapon event to server:`, payload);
    this.socketClient.send(ProtoEventType.PlayerSetWeapon, payload);
  }

  private clientHandleWeaponPurchased(payload: WeaponPurchasedPayload): void {
    this.socketClient.send(ProtoEventType.WeaponPurchased, payload);
  }

  private clientHandleUpdateScore(payload: UpdateScoreEventPayload): void {
    this.socketClient.send(ProtoEventType.PlayerScoreUpdate, payload);
  }

  // Обработчики серверных событий

  private serverHandleGameState(payload: EventGameState): void {
    logger.debug(`Game state:`, payload);
    emitEvent(this.scene, Game.Events.State.Remote, payload);
  }

  private serverHandlePlayerJoined(payload: EventPlayerJoined): void {
    logger.info(`Player ${payload.playerId} joined.`);
    emitEvent(this.scene, Player.Events.Join.Remote, payload);
  }

  private serverHandlePlayerLeft(payload: EventPlayerLeft): void {  
    logger.info(`Player ${payload.playerId} left.`);
    emitEvent(this.scene, Player.Events.Left.Remote, payload);
  }

  private serverHandlePlayerSetWeapon(payload: EventPlayerSetWeapon): void {
    logger.info(`Player ${payload.playerId} set weapon to ${payload.weaponType}`);
    const data = payload as Player.Events.SetWeapon.Payload;
    emitEvent(this.scene, Player.Events.SetWeapon.Remote, data);
  }

  private serverHandlePlayerPosition(payload: EventPlayerPosition): void {
    // logger.info(`Player ${payload.playerId} state updated:`, payload);
    const data = payload as Player.Events.State.Payload;
    emitEvent(this.scene, Player.Events.State.Remote, data);
  }
  
  private serverHandleFireEvent(payload: EventWeaponFireAction): void {
    logger.info('Received fire event from player:', payload);
    const data = payload as Weapon.Events.FireAction.Payload;
    emitEvent(this.scene, Weapon.Events.FireAction.Remote, data);
  }   

  private serverHandleWaveStart(payload: EventWaveStart): void {
    logger.info(`Wave ${payload.number} started.`);
  }

  private serverHandleSpawnEnemy(payload: EventSpawnEnemy): void {
    logger.info(`Spawning enemy`, payload);
  } 

  private serverHandleEnemyDeath(payload: EventEnemyDeath): void {
    logger.info(`Enemy ${payload.id} died.`);
  }

  private serverHandlePlayerScoreUpdate(payload: EventPlayerScoreUpdate): void {
    logger.info(`Player ${payload.playerId} score updated: ${payload.score}`);
  }

  private serverHandleWeaponPurchased(payload: EventWeaponPurchased): void {
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