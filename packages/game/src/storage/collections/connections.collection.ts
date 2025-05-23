import { defineCollection } from "@hunter/multiplayer/dist/client";
import { Connection } from "@hunter/storage-proto/dist/storage";

export const connectionsCollection = defineCollection<Connection>('connections', {
    encode: Connection.encode,
    decode: Connection.decode,
    saveData: true,
});
