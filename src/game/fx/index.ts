import { loadSpriteSheet } from "../utils/sprite";
import { MuzzleFlashTexture } from "./muzzleFlash/muzzleFlash";


export function preloadFx(scene: Phaser.Scene): void {
  loadSpriteSheet(scene, MuzzleFlashTexture);
}
