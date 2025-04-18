import { ProjectileEntity, ProjectileEntityOptions, ProjectileType } from "../core/entities/ProjectileEntity";
import { GrenadeImageTexture_0 } from "../textures/GrenadeTexture";

const ProjectileGrenadeConfig: ProjectileEntityOptions = {
  type: ProjectileType.GRENADE,
  texture: GrenadeImageTexture_0,
  drag: 1200,
  activateDelay: 1200,
  bounce: 1,
  gravity: 600,
  radius: 100,
}

export class ProjectileGrenade extends ProjectileEntity {

  static preload(scene: Phaser.Scene): void {
    scene.load.image(GrenadeImageTexture_0.key, GrenadeImageTexture_0.url);
  }

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, ProjectileGrenadeConfig);
  }
  
}