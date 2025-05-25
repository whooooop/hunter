import { defineCollection } from "@hunter/multiplayer/dist/server";
import { PlayerWeapon } from "@hunter/storage-proto";

export const playerWeaponCollection = defineCollection<PlayerWeapon>('playerWeapon', {
  encode: PlayerWeapon.encode,
  decode: PlayerWeapon.decode,
  throttle: 0,
}); 