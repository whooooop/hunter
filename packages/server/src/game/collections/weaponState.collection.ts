import { defineCollection } from "@hunter/multiplayer/dist/server";
import { WeaponState } from "@hunter/storage-proto";

export const weaponStateCollection = defineCollection<WeaponState>('weaponState', {
  encode: WeaponState.encode,
  decode: WeaponState.decode,
  saveData: true,
}); 