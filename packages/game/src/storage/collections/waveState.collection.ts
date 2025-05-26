import { defineCollection } from "@hunter/multiplayer/dist/client";
import { WaveState } from "@hunter/storage-proto/dist/storage";

export const waveStateCollection = defineCollection<WaveState>('waveState', {
  encode: WaveState.encode,
  decode: WaveState.decode,
  localEvents: true
});