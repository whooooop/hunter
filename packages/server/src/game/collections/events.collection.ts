import { defineCollection } from "@hunter/multiplayer/dist/server";
import { EnemyDeathEvent, PlayerJumpEvent, WeaponFireEvent, WeaponReloadEvent } from "@hunter/storage-proto/dist/storage";

export const fireEventCollection = defineCollection<WeaponFireEvent>('fireEvent', {
  encode: WeaponFireEvent.encode,
  decode: WeaponFireEvent.decode,
  saveData: false,
});

export const reloadEventCollection = defineCollection<WeaponReloadEvent>('reloadEvent', {
  encode: WeaponReloadEvent.encode,
  decode: WeaponReloadEvent.decode,
  saveData: false,
});

export const jumpEventCollection = defineCollection<PlayerJumpEvent>('jumpEvent', {
  encode: PlayerJumpEvent.encode,
  decode: PlayerJumpEvent.decode,
  saveData: false,
});

export const enemyDeathEventCollection = defineCollection<EnemyDeathEvent>('enemyDeathEvent', {
  encode: EnemyDeathEvent.encode,
  decode: EnemyDeathEvent.decode,
  saveData: false,
});