import { defineCollection } from "@hunter/multiplayer/dist/client";
import { PlayerState } from "@hunter/storage-proto/dist/storage";

export const playerStateCollection = defineCollection<PlayerState>('playerState', {
  encode: PlayerState.encode,
  decode: PlayerState.decode,
  localEvents: true,
});