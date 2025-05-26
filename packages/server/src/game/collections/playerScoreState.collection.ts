import { defineCollection } from "@hunter/multiplayer/dist/server";
import { PlayerScoreState } from "@hunter/storage-proto";

export const playerScoreStateCollection = defineCollection<PlayerScoreState>('playerScoreState', {
  encode: PlayerScoreState.encode,
  decode: PlayerScoreState.decode,
  saveData: true,
});
