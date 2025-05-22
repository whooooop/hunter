import { defineCollection } from "@hunter/multiplayer/dist/server";
import { Connection } from "@hunter/storage-proto";

export const connectionsCollection = defineCollection<Connection>('connections', {
    encode: Connection.encode,
    decode: Connection.decode,
    saveData: true,
});
