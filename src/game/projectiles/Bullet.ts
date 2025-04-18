import { ProjectileEntity, ProjectileType } from "../core/entities/ProjectileEntity";
import { ProjectileEntityOptions } from "../core/entities/ProjectileEntity";
import { BulletImageTexture_0, createBulletTexture } from "../textures/BulletTexture";

const type = ProjectileType.BULLET;

const ProjectileBulletConfig: ProjectileEntityOptions = {
  type: ProjectileType.BULLET,
  texture: BulletImageTexture_0,
  radius: 100,
  activateRadius: 20
}

export class ProjectileBullet extends ProjectileEntity {

  static preload(scene: Phaser.Scene): void {
    createBulletTexture(scene, BulletImageTexture_0.key);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, ProjectileBulletConfig);
  }

}