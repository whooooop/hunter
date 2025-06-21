import { defineCollection } from "@hunter/multiplayer";
import { PlayerState } from "@hunter/storage-proto/src/storage";

export const playerStateCollection = defineCollection<PlayerState>('playerState', {
  encode: PlayerState.encode,
  decode: PlayerState.decode,
  localEvents: true,
  throttle: 60,
});