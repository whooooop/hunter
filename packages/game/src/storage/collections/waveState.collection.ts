import { defineCollection } from "@hunter/multiplayer";
import { WaveState } from "@hunter/storage-proto/src/storage";

export const waveStateCollection = defineCollection<WaveState>('waveState', {
  encode: WaveState.encode,
  decode: WaveState.decode,
  localEvents: true
});