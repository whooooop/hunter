import { defineCollection } from "@hunter/multiplayer";
import { ConnectionState } from "@hunter/storage-proto/src/storage";

export const connectionStateCollection = defineCollection<ConnectionState>('connectionState', {
  encode: ConnectionState.encode,
  decode: ConnectionState.decode,
});
