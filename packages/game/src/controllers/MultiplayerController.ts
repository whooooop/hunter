import { emitEvent, offEvent, onEvent } from "../GameEvents";
import { createLogger } from '../utils/logger';
import { GameplayScene } from '../scenes/GameplayScene/GameplayScene';
import { Game } from '../types/gameTypes';
import { ClientMultiplayer, StorageSpace } from '@hunter/multiplayer/dist/client';
import { connectionsCollection } from "../storage/collections/connections.collection";

const logger = createLogger('MultiplayerController');
const SERVER_URL = 'ws://localhost:3000';

export class MultiplayerController {
  private isHost: boolean = false;
  private playerId: string = '';
  private connectedPlayers: Set<string> = new Set();
  private maxPlayers: number = 2;

  private client: ClientMultiplayer;

  constructor(
    private readonly scene: GameplayScene,
    private readonly storage: StorageSpace
  ) {
    this.client = new ClientMultiplayer({
      baseUrl: SERVER_URL,
      storage: this.storage
    });
  }

  public connect(gameId: string, playerId: string): Promise<void> {
    this.playerId = playerId;
    return this.client.connect(gameId, playerId);
  }

  public setReady(): void {
    const collections = this.storage.getCollection(connectionsCollection)!;
    collections.updateItem(this.playerId, { ready: true });
  }

  // Обработчики локальных событий Phaser (отправка на сервер)
  // private setupLocalEventHandlers(): void {
  //   onEvent(this.scene, Weapon.Events.FireAction.Local, this.clientHandleFire, this);
  //   onEvent(this.scene, Player.Events.SetWeapon.Local, this.clientHandleSetWeapon, this);
  //   onEvent(this.scene, Player.Events.State.Local, this.clientHandlePlayerState, this);

  //   onEvent(this.scene, Wave.Events.WaveStart.Local, this.clientHandleWaveStart, this);
  //   onEvent(this.scene, Wave.Events.Spawn.Local, this.clientHandleSpawnEnemy, this);
  //   onEvent(this.scene, Enemy.Events.Death.Local, this.clientHandleEnemyDeath, this);
  //   onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.clientHandleWeaponPurchased, this);
  //   onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.clientHandleUpdateScore, this);
  // }

  private setupServerEventHandlers(): void {
    // this.socketClient.on('GameState', this.serverHandleGameState.bind(this));
    // this.socketClient.on('PlayerJoined', this.serverHandlePlayerJoined.bind(this));
    // this.socketClient.on('PlayerLeft', this.serverHandlePlayerLeft.bind(this));
    // this.socketClient.on('PlayerSetWeapon', this.serverHandlePlayerSetWeapon.bind(this));
    // this.socketClient.on('PlayerPosition', this.serverHandlePlayerPosition.bind(this));

    // this.socketClient.on('WeaponFireAction', this.serverHandleFireEvent.bind(this));
    // this.socketClient.on('SpawnEnemy', this.serverHandleSpawnEnemy.bind(this));

    // this.socketClient.on('WaveStart', this.serverHandleWaveStart.bind(this));
    // this.socketClient.on('EnemyDeath', this.serverHandleEnemyDeath.bind(this));
    // this.socketClient.on(SocketEvents.PlayerScoreUpdate, this.serverHandlePlayerScoreUpdate.bind(this));
    // this.socketClient.on('WeaponPurchased', this.serverHandleWeaponPurchased.bind(this));
  }

  private checkAllPlayersConnected(): void {
    if (this.connectedPlayers.size === this.maxPlayers && this.isHost) {
      emitEvent(this.scene, Game.Events.Multiplayer.Ready.Local, {});
    }
  }


  // Обработчики локальных событий

  // private clientHandleFire(payload: Weapon.Events.FireAction.Payload): void {
  //   this.socketClient.send(ProtoEventType.WeaponFireAction, payload);
  // }

  // private clientHandlePlayerState(payload: Player.Events.State.Payload): void {
  //   this.socketClient.send(ProtoEventType.PlayerPosition, payload);
  // }

  // private clientHandleWaveStart(payload: Wave.Events.WaveStart.Payload): void {
  //   this.socketClient.send(ProtoEventType.WaveStart, payload);
  // }

  // private clientHandleSpawnEnemy(payload: Wave.Events.Spawn.Payload): void {
  //   this.socketClient.send(ProtoEventType.SpawnEnemy, {
  //     id: payload.id,
  //     enemyType: payload.enemyType,
  //     config: {
  //       x: payload.config.x,
  //       y: payload.config.y,
  //       velocityX: payload.config.velocityX ?? 0,
  //       velocityY: payload.config.velocityY ?? 0,
  //       level: payload.config.level ?? 0,
  //       health: payload.config.health ?? 0
  //     },
  //     boss: payload.boss
  //   });
  // }

  // private clientHandleEnemyDeath(payload: Enemy.Events.Death.Payload): void {
  //   this.socketClient.send(ProtoEventType.EnemyDeath, payload);
  // }

  // private clientHandleSetWeapon(payload: Player.Events.SetWeapon.Payload): void {
  //   logger.info(`Sending PlayerSetWeapon event to server:`, payload);
  //   this.socketClient.send(ProtoEventType.PlayerSetWeapon, payload);
  // }

  // private clientHandleWeaponPurchased(payload: WeaponPurchasedPayload): void {
  //   this.socketClient.send(ProtoEventType.WeaponPurchased, payload);
  // }

  // private clientHandleUpdateScore(payload: UpdateScoreEventPayload): void {
  //   this.socketClient.send(ProtoEventType.PlayerScoreUpdate, payload);
  // }

  // Обработчики серверных событий

  // private serverHandleGameState(payload: EventGameState): void {
  //   this.isHost = payload.host === this.playerId;
  //   this.connectedPlayers = new Set(payload.connected);
  //   this.checkAllPlayersConnected();
  //   logger.debug(`Game state:`, payload);
  //   emitEvent(this.scene, Game.Events.State.Remote, payload);
  // }

  // private serverHandlePlayerJoined(payload: EventPlayerJoined): void {
  //   logger.info(`Player ${payload.playerId} joined.`);
  //   this.connectedPlayers.add(payload.playerId);
  //   this.checkAllPlayersConnected();
  //   emitEvent(this.scene, Player.Events.Join.Remote, payload);
  // }

  // private serverHandlePlayerLeft(payload: EventPlayerLeft): void {  
  //   logger.info(`Player ${payload.playerId} left.`);
  //   this.connectedPlayers.delete(payload.playerId);
  //   emitEvent(this.scene, Player.Events.Left.Remote, payload);
  // }

  // private serverHandlePlayerSetWeapon(payload: EventPlayerSetWeapon): void {
  //   logger.info(`Player ${payload.playerId} set weapon to ${payload.weaponType}`);
  //   const data = payload as Player.Events.SetWeapon.Payload;
  //   emitEvent(this.scene, Player.Events.SetWeapon.Remote, data);
  // }

  // private serverHandlePlayerPosition(payload: EventPlayerPosition): void {
  //   // logger.info(`Player ${payload.playerId} state updated:`, payload);
  //   const data = payload as Player.Events.State.Payload;
  //   emitEvent(this.scene, Player.Events.State.Remote, data);
  // }
  
  // private serverHandleFireEvent(payload: EventWeaponFireAction): void {
  //   logger.info('Received fire event from player:', payload);
  //   const data = payload as Weapon.Events.FireAction.Payload;
  //   emitEvent(this.scene, Weapon.Events.FireAction.Remote, data);
  // }   

  // private serverHandleWaveStart(payload: EventWaveStart): void {
  //   logger.info(`Wave ${payload.number} started.`);
  // }

  // private serverHandleSpawnEnemy(payload: EventSpawnEnemy): void {
  //   emitEvent(this.scene, Wave.Events.Spawn.Remote, {
  //     id: payload.id,
  //     enemyType: payload.enemyType as Enemy.Type,
  //     config: {
  //       x: payload.config?.x ?? 0,
  //       y: payload.config?.y ?? 0,
  //       velocityX: payload.config?.velocityX || undefined,
  //       velocityY: payload.config?.velocityY || undefined,
  //       level: payload.config?.level || undefined,
  //       health: payload.config?.health || undefined
  //     },
  //     boss: payload.boss
  //   });
  // } 

  // private serverHandleEnemyDeath(payload: EventEnemyDeath): void {
  //   logger.info(`Enemy ${payload.id} died.`);
  // }

  // private serverHandlePlayerScoreUpdate(payload: EventPlayerScoreUpdate): void {
  //   logger.info(`Player ${payload.playerId} score updated: ${payload.score}`);
  // }

  // private serverHandleWeaponPurchased(payload: EventWeaponPurchased): void {
  //   logger.info(`Player ${payload.playerId} purchased ${payload.weaponType}`);
  // }

  // public destroy(): void {
  //   this.socketClient.disconnect();

  //   this.scene.events.off(Weapon.Events.FireAction.Local, this.clientHandleFire, this);
  //   this.scene.events.off(Player.Events.SetWeapon.Local, this.clientHandleSetWeapon, this);

  //   offEvent(this.scene, Enemy.Events.Death.Local, this.clientHandleEnemyDeath, this);
  //   offEvent(this.scene, Wave.Events.WaveStart.Local, this.clientHandleWaveStart, this);
  //   offEvent(this.scene, Wave.Events.Spawn.Local, this.clientHandleSpawnEnemy, this);
  //   offEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.clientHandleWeaponPurchased, this);
  //   offEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.clientHandleUpdateScore, this);
  // }
}
