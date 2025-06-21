import { defineCollection } from "@hunter/multiplayer";
import { GameState } from "@hunter/storage-proto/src/storage";

export const gameStateCollection = defineCollection<GameState>('gameState', {
  encode: GameState.encode,
  decode: GameState.decode,
  localEvents: true,
});