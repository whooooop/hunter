import { defineCollection } from "@hunter/multiplayer";
import { PlayerScoreState } from "@hunter/storage-proto/src/storage";

export const playerScoreStateCollection = defineCollection<PlayerScoreState>('playerScoreState', {
  encode: PlayerScoreState.encode,
  decode: PlayerScoreState.decode,
  localEvents: true,
});
