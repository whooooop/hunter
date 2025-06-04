import { defineCollection } from "@hunter/multiplayer/dist/client";
import { PlayerSkin } from "@hunter/storage-proto/dist/storage";

export const playerSkinCollection = defineCollection<PlayerSkin>('playerSkin', {
  encode: PlayerSkin.encode,
  decode: PlayerSkin.decode,
  throttle: 0,
});