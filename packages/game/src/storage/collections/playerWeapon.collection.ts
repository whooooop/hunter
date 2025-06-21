import { defineCollection } from "@hunter/multiplayer";
import { PlayerWeapon } from "@hunter/storage-proto/src/storage";

export const playerWeaponCollection = defineCollection<PlayerWeapon>('playerWeapon', {
  encode: PlayerWeapon.encode,
  decode: PlayerWeapon.decode,
  localEvents: true
});