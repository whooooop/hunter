import { ClientMultiplayer, StorageSpace } from '@hunter/multiplayer/dist/client';
import { GameplayScene } from '../scenes/GameplayScene/GameplayScene';
import { connectionStateCollection } from "../storage/collections/connectionState.collection";
import { createLogger } from '../utils/logger';

const logger = createLogger('MultiplayerController');
const SERVER_URL = 'ws://localhost:3000';

export class MultiplayerController {
  private playerId: string = '';

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
  //   onEvent(this.scene, Wave.Events.WaveStart.Local, this.clientHandleWaveStart, this);
  // }

  private setupServerEventHandlers(): void {
    // this.socketClient.on('WaveStart', this.serverHandleWaveStart.bind(this));
    // this.socketClient.on('EnemyDeath', this.serverHandleEnemyDeath.bind(this));
  }

  // Обработчики локальных событий

  // private clientHandleWaveStart(payload: Wave.Events.WaveStart.Payload): void {
  //   this.socketClient.send(ProtoEventType.WaveStart, payload);
  // }

  // private clientHandleEnemyDeath(payload: Enemy.Events.Death.Payload): void {
  //   this.socketClient.send(ProtoEventType.EnemyDeath, payload);
  // }

  // private serverHandleWaveStart(payload: EventWaveStart): void {
  //   logger.info(`Wave ${payload.number} started.`);
  // }

  // private serverHandleEnemyDeath(payload: EventEnemyDeath): void {
  //   logger.info(`Enemy ${payload.id} died.`);
  // }


  public destroy(): void {

  }
}
