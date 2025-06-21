import { defineCollection } from "@hunter/multiplayer";
import { WeaponState } from "@hunter/storage-proto/src/storage";

export const weaponStateCollection = defineCollection<WeaponState>('weaponState', {
  encode: WeaponState.encode,
  decode: WeaponState.decode,
  localEvents: true
}); 