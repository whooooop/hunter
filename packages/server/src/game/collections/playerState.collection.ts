import { defineCollection } from "@hunter/multiplayer/dist/server";
import { PlayerState } from "@hunter/storage-proto";

export const playerStateCollection = defineCollection<PlayerState>('playerState', {
    encode: PlayerState.encode,
    decode: PlayerState.decode,
    saveData: true,
    throttle: 0,
}); 