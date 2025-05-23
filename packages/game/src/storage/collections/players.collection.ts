import { defineCollection } from  "@hunter/multiplayer/dist/client";
import { Player } from "@hunter/storage-proto/dist/storage";

export const playersCollection = defineCollection<Player>('players', {
    encode: Player.encode,
    decode: Player.decode,
    saveData: true,
    throttle: 1000,
});