import { ProjectileEntity } from "../core/entities/ProjectileEntity";
import { Projectile } from "../core/types/projectrileTypes";
import { MineImageTexture_0 } from "../textures/mineTexture";

export const ProjectileMineConfig: Projectile.Config = {
  type: Projectile.Type.MINE,
  texture: MineImageTexture_0,
  radius: 100,
  activateRadius: 20,
  drag: 800,
  gravity: 600,
}