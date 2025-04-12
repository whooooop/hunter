import { createTextureKey } from "../../../utils/texture";
import { BaseProjectile, ProjectileType } from "../../core/BaseProjectile";

import grenadeImage from './assets/grenade.png';

const texture = createTextureKey('bullet');
const type = ProjectileType.GRENADE;

export class ProjetileGrenage extends BaseProjectile {
  constructor() {
    super({
      type,
      texture,
      scale: 0.5,
    })
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture, grenadeImage);
  }
}