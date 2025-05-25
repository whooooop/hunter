import { ClientMultiplayer, StorageSpace } from '@hunter/multiplayer/dist/client';
import { GameplayScene } from '../scenes/GameplayScene/GameplayScene';
import { connectionStateCollection } from "../storage/collections/connectionState.collection";
import { createLogger } from '../utils/logger';

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
    (window as any)['_s'] = this.storage;
    this.client = new ClientMultiplayer({
      baseUrl: SERVER_URL,
      storage: this.storage
    });
  }

  public get ping(): number {
    return this.client.ping;
  }

  public connect(gameId: string, playerId: string): Promise<void> {
    this.playerId = playerId;
    return this.client.connect(gameId, playerId);
  }

  public setReady(): void {
    const collections = this.storage.getCollection(connectionStateCollection)!;
    collections.updateItem(this.playerId, { ready: true });
  }

  // Обработчики локальных событий Phaser (отправка на сервер)
  // private setupLocalEventHandlers(): void {
  //   onEvent(this.scene, Weapon.Events.FireAction.Local, this.clientHandleFire, this);
  //   onEvent(this.scene, Player.Events.SetWeapon.Local, this.clientHandleSetWeapon, this);
  //   onEvent(this.scene, Player.Events.State.Local, this.clientHandlePlayerState, this);

  //   onEvent(this.scene, Wave.Events.WaveStart.Local, this.clientHandleWaveStart, this);
  //   onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.clientHandleWeaponPurchased, this);
  //   onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.clientHandleUpdateScore, this);
  // }

  private setupServerEventHandlers(): void {
    // this.socketClient.on('PlayerSetWeapon', this.serverHandlePlayerSetWeapon.bind(this));
    // this.socketClient.on('PlayerPosition', this.serverHandlePlayerPosition.bind(this));

    // this.socketClient.on('WeaponFireAction', this.serverHandleFireEvent.bind(this));
    // this.socketClient.on('SpawnEnemy', this.serverHandleSpawnEnemy.bind(this));

    // this.socketClient.on('WaveStart', this.serverHandleWaveStart.bind(this));
    // this.socketClient.on('EnemyDeath', this.serverHandleEnemyDeath.bind(this));
    // this.socketClient.on(SocketEvents.PlayerScoreUpdate, this.serverHandlePlayerScoreUpdate.bind(this));
    // this.socketClient.on('WeaponPurchased', this.serverHandleWeaponPurchased.bind(this));
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


  // private serverHandlePlayerSetWeapon(payload: EventPlayerSetWeapon): void {
  //   logger.info(`Player ${payload.playerId} set weapon to ${payload.weaponType}`);
  //   const data = payload as Player.Events.SetWeapon.Payload;
  //   emitEvent(this.scene, Player.Events.SetWeapon.Remote, data);
  // }

  // private serverHandleFireEvent(payload: EventWeaponFireAction): void {
  //   logger.info('Received fire event from player:', payload);
  //   const data = payload as Weapon.Events.FireAction.Payload;
  //   emitEvent(this.scene, Weapon.Events.FireAction.Remote, data);
  // }   

  // private serverHandleWaveStart(payload: EventWaveStart): void {
  //   logger.info(`Wave ${payload.number} started.`);
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

  public destroy(): void {

  }
}
