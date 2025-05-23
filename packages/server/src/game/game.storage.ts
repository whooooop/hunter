import { defineStorageSpace } from "@hunter/multiplayer/dist/server";
import { playersCollection } from "./collections/players.collection";
import { connectionsCollection } from "./collections/connections.collection";

export const gameStorage = defineStorageSpace('game', {
    collections: [
      connectionsCollection,
      playersCollection,
    ]
});