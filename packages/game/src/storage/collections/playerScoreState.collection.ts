import { defineCollection } from "@hunter/multiplayer/dist/client";
import { PlayerScoreState } from "@hunter/storage-proto/dist/storage";

export const playerScoreStateCollection = defineCollection<PlayerScoreState>('playerScoreState', {
  encode: PlayerScoreState.encode,
  decode: PlayerScoreState.decode,
});
