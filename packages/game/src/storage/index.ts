import { defineStorageSpace } from "@hunter/multiplayer";
import { connectionStateCollection } from "./collections/connectionState.collection";
import { enemyStateCollection } from "./collections/enemyState.collection";
import { embienceEvent, enemyAnimationEvent, enemyDeathEventCollection, fireEventCollection, jumpEventCollection, reloadEventCollection, replayEventCollection } from "./collections/events.collectio";
import { gameStateCollection } from "./collections/gameState.collection";
import { playerScoreStateCollection } from "./collections/playerScoreState.collection";
import { playerSkinCollection } from "./collections/playerSkin.collection";
import { playerStateCollection } from "./collections/playerState.collection";
import { playerWeaponCollection } from "./collections/playerWeapon.collection";
import { waveStateCollection } from "./collections/waveState.collection";
import { weaponStateCollection } from "./collections/weaponState.collection";

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionStateCollection,
    playerStateCollection,
    playerWeaponCollection,
    playerSkinCollection,
    gameStateCollection,
    enemyStateCollection,
    weaponStateCollection,
    playerScoreStateCollection,
    waveStateCollection,

    fireEventCollection,
    reloadEventCollection,
    jumpEventCollection,
    embienceEvent,
    enemyDeathEventCollection,
    enemyAnimationEvent,
    replayEventCollection,
  ],
});