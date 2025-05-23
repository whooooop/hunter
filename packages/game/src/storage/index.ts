import { defineStorageSpace } from "@hunter/multiplayer/dist/client";
import { connectionsCollection } from "./collections/connections.collection";
import { playersCollection } from "./collections/players.collection";

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionsCollection,
    playersCollection,
  ],
});