import { defineStorageSpace } from "@hunter/multiplayer/dist/server";
import { playerStateCollection } from "./collections/playerState.collection";
import { connectionStateCollection } from "./collections/connectionState.collection";

export const gameStorage = defineStorageSpace('game', {
    collections: [
      connectionStateCollection,
      playerStateCollection,
    ]
});