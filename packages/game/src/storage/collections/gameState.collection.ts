import { defineCollection } from "@hunter/multiplayer/dist/client";
import { GameState } from "@hunter/storage-proto/dist/storage";

export const gameStateCollection = defineCollection<GameState>('gameState', {
  encode: GameState.encode,
  decode: GameState.decode,
  readonly: true,
});