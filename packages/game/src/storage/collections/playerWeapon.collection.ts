import { defineCollection } from "@hunter/multiplayer/dist/client";
import { PlayerWeapon } from "@hunter/storage-proto/dist/storage";

export const playerWeaponCollection = defineCollection<PlayerWeapon>('playerWeapon', {
  encode: PlayerWeapon.encode,
  decode: PlayerWeapon.decode,
  localEvents: true
});