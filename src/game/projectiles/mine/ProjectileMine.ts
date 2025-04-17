import { createTextureKey } from "../../../utils/texture";
import { ProjectileEntity, ProjectileType } from "../../core/entities/ProjectileEntity";

import mineImage from './assets/mine.png';

const texture = createTextureKey('mine');
const type = ProjectileType.MINE;

  export class ProjetileMine extends ProjectileEntity {
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