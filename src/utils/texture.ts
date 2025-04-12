import { generateStringWithLength } from "./stringGenerator";

export function createTextureKey(prefix: string) {
  return prefix + '_' + generateStringWithLength(4);
}