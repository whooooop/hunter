import { GameStorage, StorageStrategy } from "../GameStorage";
import { Bank } from "../types";
import { PlayerService } from "./PlayerService";

export class BankService {
  private static instance: BankService;
  private storage: GameStorage;
  private playerService: PlayerService;

  private static readonly DEFAULT_STATE: Bank.State = {
    [Bank.Currency.Star]: 0
  }

  static getInstance(): BankService {
    if (!BankService.instance) {
      BankService.instance = new BankService();
    }
    return BankService.instance;
  }

  private constructor() {
    this.storage = new GameStorage(StorageStrategy.Local);
    this.playerService = PlayerService.getInstance();
  }

  private getPlayerKey(playerId: string): string {
    return `player_balance_${playerId}`;
  }

  private async setPlayerState(playerId: string, state: Bank.State): Promise<void> {
    const key = this.getPlayerKey(playerId);
    await this.storage.set(key, state);
  }

  private async getPlayerState(playerId: string): Promise<Bank.State> {
    const key = this.getPlayerKey(playerId);
    const state = await this.storage.get<Bank.State>(key);
    if (!state) {
      return { ...BankService.DEFAULT_STATE }
    }
    return { ...BankService.DEFAULT_STATE, ...state };
  }

  static async getPlayerBalance(currency: Bank.Currency): Promise<number> {
    const instance = BankService.getInstance();
    const playerId = instance.playerService.getCurrentPlayerId();
    const state = await instance.getPlayerState(playerId);
    return state[currency];
  }

  async setPlayerBalance(currency: Bank.Currency, balance: number): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    const state = await this.getPlayerState(playerId);
    state[currency] = balance;
    await this.setPlayerState(playerId, state);
  }

  async increasePlayerBalance(currency: Bank.Currency, balance: number): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    const state = await this.getPlayerState(playerId);
    state[currency] += balance;
    await this.setPlayerState(playerId, state);
  }

  async decreasePlayerBalance(currency: Bank.Currency, balance: number): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    const state = await this.getPlayerState(playerId);
    state[currency] -= balance;
    await this.setPlayerState(playerId, state);
  }

}

