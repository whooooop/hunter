import { defineStorageSpace } from "@hunter/multiplayer/dist/client";
import { connectionStateCollection } from "./collections/connectionState.collection";
import { playerStateCollection } from "./collections/playerState.collection";

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionStateCollection,
    playerStateCollection,
  ],
});