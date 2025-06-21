import { defineCollection } from "@hunter/multiplayer";
import { PlayerSkin } from "@hunter/storage-proto/src/storage";

export const playerSkinCollection = defineCollection<PlayerSkin>('playerSkin', {
  encode: PlayerSkin.encode,
  decode: PlayerSkin.decode,
  throttle: 0,
});