import { defineCollection } from "@hunter/multiplayer/dist/server";
import { EnemyAnimationEvent, EnemyDeathEvent, PlayerJumpEvent, WeaponFireEvent, WeaponReloadEvent } from "@hunter/storage-proto/dist/storage";

export const fireEvent = defineCollection<WeaponFireEvent>('fireEvent', {
  encode: WeaponFireEvent.encode,
  decode: WeaponFireEvent.decode,
  saveData: false,
});

export const reloadEvent = defineCollection<WeaponReloadEvent>('reloadEvent', {
  encode: WeaponReloadEvent.encode,
  decode: WeaponReloadEvent.decode,
  saveData: false,
});

export const jumpEvent = defineCollection<PlayerJumpEvent>('jumpEvent', {
  encode: PlayerJumpEvent.encode,
  decode: PlayerJumpEvent.decode,
  saveData: false,
});

export const enemyDeathEvent = defineCollection<EnemyDeathEvent>('enemyDeathEvent', {
  encode: EnemyDeathEvent.encode,
  decode: EnemyDeathEvent.decode,
  saveData: false,
});

export const enemyAnimationEvent = defineCollection<EnemyAnimationEvent>('enemyAnimationEvent', {
  encode: EnemyAnimationEvent.encode,
  decode: EnemyAnimationEvent.decode,
  saveData: false,
});