import { createTextureKey } from "../../../utils/texture";
import { ProjectileEntity, createBulletTexture, ProjectileType } from "../../core/entities/ProjectileEntity";

const texture = createTextureKey('bullet');
const type = ProjectileType.BULLET;

export class Bullet extends ProjectileEntity {

  static preload(scene: Phaser.Scene): void {
    createBulletTexture(scene, texture);
  }

  constructor() {
    super({
      type,
      texture
    })
  }

}