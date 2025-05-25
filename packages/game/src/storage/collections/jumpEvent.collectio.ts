import { defineCollection } from "@hunter/multiplayer/dist/client";
import { JumpEvent } from "@hunter/storage-proto/dist/storage";

export const jumpEventCollection = defineCollection<JumpEvent>('jumpEvent', {
  encode: JumpEvent.encode,
  decode: JumpEvent.decode,
  saveData: false,
});