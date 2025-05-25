import { defineStorageSpace } from "@hunter/multiplayer/dist/client";
import { connectionStateCollection } from "./collections/connectionState.collection";
import { enemyStateCollection } from "./collections/enemyState.collection";
import { enemyDeathEventCollection, fireEventCollection, jumpEventCollection, reloadEventCollection } from "./collections/events.collectio";
import { gameStateCollection } from "./collections/gameState.collection";
import { playerScoreStateCollection } from "./collections/playerScoreState.collection";
import { playerStateCollection } from "./collections/playerState.collection";
import { playerWeaponCollection } from "./collections/playerWeapon.collection";
import { weaponStateCollection } from "./collections/weaponState.collection";

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionStateCollection,
    playerStateCollection,
    playerWeaponCollection,
    gameStateCollection,
    enemyStateCollection,
    weaponStateCollection,
    playerScoreStateCollection,

    fireEventCollection,
    reloadEventCollection,
    jumpEventCollection,
    enemyDeathEventCollection,
  ],
});