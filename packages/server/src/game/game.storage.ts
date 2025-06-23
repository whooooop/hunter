import { defineStorageSpace } from '@hunter/multiplayer/dist/server';
import { connectionStateCollection } from './collections/connectionState.collection';
import { enemyStateCollection } from './collections/enemyState.collection';
import { countdownEvent, embienceEvent, enemyAnimationEvent, enemyDeathEvent, fireEvent, jumpEvent, reloadEvent, replayEvent } from './collections/events.collection';
import { gameStateCollection } from './collections/gameState.collection';
import { playerScoreStateCollection, playerSkinCollection, playerStateCollection, playerWeaponCollection } from './collections/player.collections';
import { waveStateCollection } from './collections/waveState.collection';
import { weaponStateCollection } from './collections/weaponState.collection';

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionStateCollection,
    gameStateCollection,
    waveStateCollection,
    enemyStateCollection,
    weaponStateCollection,

    playerStateCollection,
    playerWeaponCollection,
    playerScoreStateCollection,
    playerSkinCollection,

    fireEvent,
    reloadEvent,
    jumpEvent,
    enemyDeathEvent,
    enemyAnimationEvent,
    replayEvent,
    embienceEvent,
    countdownEvent,
  ]
});
