import { defineCollection } from "@hunter/multiplayer/dist/server";
import { EnemyState } from "@hunter/storage-proto/dist/storage";

export const enemyStateCollection = defineCollection<EnemyState>('enemyState', {
  encode: EnemyState.encode,
  decode: EnemyState.decode,
  throttle: 100
});