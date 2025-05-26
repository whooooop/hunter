import { defineCollection } from "@hunter/multiplayer/dist/server";
import { WaveState } from "@hunter/storage-proto/dist/storage";

export const waveStateCollection = defineCollection<WaveState>('waveState', {
  encode: WaveState.encode,
  decode: WaveState.decode,
});