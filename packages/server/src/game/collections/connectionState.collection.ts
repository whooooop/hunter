import { defineCollection } from "@hunter/multiplayer/dist/server";
import { ConnectionState } from "@hunter/storage-proto";

export const connectionStateCollection = defineCollection<ConnectionState>('connectionState', {
    encode: ConnectionState.encode,
    decode: ConnectionState.decode,
    saveData: true,
});
