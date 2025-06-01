import { defineStorageSpace } from '@hunter/multiplayer/dist/server';
import { connectionStateCollection } from './collections/connectionState.collection';
import { enemyStateCollection } from './collections/enemyState.collection';
import { enemyAnimationEvent, enemyDeathEvent, fireEvent, jumpEvent, reloadEvent, replayEvent } from './collections/events.collection';
import { gameStateCollection } from './collections/gameState.collection';
import { playerScoreStateCollection } from './collections/playerScoreState.collection';
import { playerStateCollection } from './collections/playerState.collection';
import { playerWeaponCollection } from './collections/playerWeapon.collection';
import { waveStateCollection } from './collections/waveState.collection';
import { weaponStateCollection } from './collections/weaponState.collection';

export const gameStorage = defineStorageSpace('game', {
  collections: [
    connectionStateCollection,
    playerStateCollection,
    playerWeaponCollection,
    gameStateCollection,
    waveStateCollection,
    enemyStateCollection,
    weaponStateCollection,
    playerScoreStateCollection,

    fireEvent,
    reloadEvent,
    jumpEvent,
    enemyDeathEvent,
    enemyAnimationEvent,
    replayEvent,
  ]
});
