import { ProjectileEntity, ProjectileEntityOptions, ProjectileType } from "../core/entities/ProjectileEntity";
import { MineImageTexture_0 } from "../textures/mineTexture";

const ProjectileMineConfig: ProjectileEntityOptions = {
  type: ProjectileType.MINE,
  texture: MineImageTexture_0,
  radius: 100,
  activateRadius: 20,
  drag: 800,
  gravity: 600,
}

export class ProjectileMine extends ProjectileEntity {

  static preload(scene: Phaser.Scene): void {
    scene.load.image(MineImageTexture_0.key, MineImageTexture_0.url);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, ProjectileMineConfig);
  }

}