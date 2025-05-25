import { defineCollection } from "@hunter/multiplayer/dist/client";
import { FireEvent } from "@hunter/storage-proto/dist/storage";

export const fireEventCollection = defineCollection<FireEvent>('fireEvent', {
  encode: FireEvent.encode,
  decode: FireEvent.decode,
  saveData: false,
});