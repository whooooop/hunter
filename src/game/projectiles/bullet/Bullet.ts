import { createTextureKey } from "../../../utils/texture";
import { BaseProjectile, createBulletTexture, ProjectileType } from "../../core/BaseProjectile";

const texture = createTextureKey('bullet');
const type = ProjectileType.BULLET;

export class Bullet extends BaseProjectile {
  constructor() {
    super({
      type,
      texture
    })
  }

  static preload(scene: Phaser.Scene): void {
    createBulletTexture(scene, texture);
  }
}