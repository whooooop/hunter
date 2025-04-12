import { createTextureKey } from "../../../utils/texture";
import { BaseProjectile, ProjectileType } from "../../core/BaseProjectile";

import mineImage from './assets/mine.png';

const texture = createTextureKey('mine');
const type = ProjectileType.MINE;

export class ProjetileMine extends BaseProjectile {
  constructor() {
    super({
      type,
      texture,
      scale: 0.5,
      radius: 100,
      activateRadius: 20
    })
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture, mineImage);
  }
}