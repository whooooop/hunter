import { defineCollection } from "@hunter/multiplayer/dist/server";
import { PlayerScoreState, PlayerState, PlayerWeapon } from "@hunter/storage-proto";
import { PlayerSkin } from "@hunter/storage-proto/dist/storage";

export const playerStateCollection = defineCollection<PlayerState>('playerState', {
  encode: PlayerState.encode,
  decode: PlayerState.decode,
  throttle: 0,
});

export const playerWeaponCollection = defineCollection<PlayerWeapon>('playerWeapon', {
  encode: PlayerWeapon.encode,
  decode: PlayerWeapon.decode,
  throttle: 0,
});

export const playerScoreStateCollection = defineCollection<PlayerScoreState>('playerScoreState', {
  encode: PlayerScoreState.encode,
  decode: PlayerScoreState.decode,
  saveData: true,
});

export const playerSkinCollection = defineCollection<PlayerSkin>('playerSkin', {
  encode: PlayerSkin.encode,
  decode: PlayerSkin.decode,
}); 