import { ClientMultiplayer, StorageSpace } from '@hunter/multiplayer/dist/client';
import { GameplayScene } from '../scenes/GameplayScene/GameplayScene';
import { connectionStateCollection } from "../storage/collections/connectionState.collection";
import { createLogger } from '../utils/logger';

const logger = createLogger('MultiplayerController');
const SERVER_URL = `ws://${location.hostname}:3434`;

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

  public destroy(): void {

  }
}
