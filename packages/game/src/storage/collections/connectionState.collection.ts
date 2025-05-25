import { defineCollection } from "@hunter/multiplayer/dist/client";
import { ConnectionState } from "@hunter/storage-proto/dist/storage";

export const connectionStateCollection = defineCollection<ConnectionState>('connectionState', {
  encode: ConnectionState.encode,
  decode: ConnectionState.decode,
});
