import { loadSpriteSheet } from "../utils/sprite";
import { MuzzleFlashTexture } from "./muzzleFlash/muzzleFlashFx";
import { ExplosionFx } from "./explosion/ExplosionFx";  

export function preloadFx(scene: Phaser.Scene): void {
  loadSpriteSheet(scene, MuzzleFlashTexture);
  ExplosionFx.preload(scene);
}
