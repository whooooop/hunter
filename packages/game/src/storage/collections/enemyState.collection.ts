import { defineCollection } from "@hunter/multiplayer";
import { EnemyState } from "@hunter/storage-proto/src/storage";

export const enemyStateCollection = defineCollection<EnemyState>('enemyState', {
  encode: EnemyState.encode,
  decode: EnemyState.decode,
  throttle: 100,
  localEvents: true,
});