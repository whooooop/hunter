import { createTextureKey } from "../../../utils/texture";
import { ProjectileEntity, ProjectileType } from "../../core/entities/ProjectileEntity";

import grenadeImage from './assets/grenade.png';

const texture = createTextureKey('bullet');
const type = ProjectileType.GRENADE;

export class ProjetileGrenage extends ProjectileEntity {

  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture, grenadeImage);
  }

  constructor() {
    super({
      type,
      texture,
      scale: 0.5,
      drag: 1200,
      activateDelay: 1200,
      bounce: 1,
      radius: 100,
    })
  }
  
}