import { defineCollection } from "@hunter/multiplayer/dist/server";
import { Player } from "@hunter/storage-proto";

export const playersCollection = defineCollection<Player>('players', {
    encode: Player.encode,
    decode: Player.decode,
    saveData: true,
});