import { defineCollection } from "@hunter/multiplayer/dist/client";
import { WeaponState } from "@hunter/storage-proto/dist/storage";

export const weaponStateCollection = defineCollection<WeaponState>('weaponState', {
  encode: WeaponState.encode,
  decode: WeaponState.decode,
  localEvents: true
}); 