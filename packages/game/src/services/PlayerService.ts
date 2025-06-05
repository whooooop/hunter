import { GameStorage } from "../GameStorage";
import { Player } from "../types/playerTypes";
import { logger } from "../utils/logger";
import { CHARS, generateStringWithLength } from "../utils/stringGenerator";

export class PlayerService {
  private static instance: PlayerService;
  private storage: GameStorage;
  private curentLocalPlayerId!: string;

  private getInternalPlayerIdKey(): string {
    return 'playerId';
  }

  static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  private constructor() {
    console.log('PlayerService constructor');
    this.storage = new GameStorage();
  }

  async initPlayer(externalPlayerId?: string): Promise<void> {
    const internalPlayerId = await this.getInternalPlayerId();
    this.curentLocalPlayerId = internalPlayerId;
    logger.info(`Player initialized with id: ${internalPlayerId}`);
  }

  getCurrentPlayerId(): string {
    if (!this.curentLocalPlayerId) {
      throw new Error('Player not initialized');
    }
    return this.curentLocalPlayerId;
  }

  private async createPlayer(): Promise<Player.StorageState> {
    const key = this.getInternalPlayerIdKey();
    const data: Player.StorageState = {
      id: generateStringWithLength(12, CHARS.LOWERCASE + CHARS.UPPERCASE + CHARS.DIGITS),
    }
    await this.storage.set(key, data);
    return data;
  }

  private async getInternalPlayerId(): Promise<string> {
    const key = this.getInternalPlayerIdKey();
    const localPlayer = await this.storage.get<Player.StorageState>(key);
    if (!localPlayer) {
      const player = await this.createPlayer();
      return player.id;
    }
    return localPlayer.id;
  }

  // getPlayerState(playerId: string): Player.StorageState {
  //   const state = this.storage.get(playerId);
  //   if (!state) {
  //     return this.createPlayer();
  //   }
  //   return state;
  // }
}