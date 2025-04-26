import { Projectile } from "../core/types/projectrileTypes";
import { BulletImageTexture_0 } from "../textures/BulletTexture";

export const ProjectilePelletsConfig: Projectile.Config = {
  type: Projectile.Type.BULLET,
  texture: BulletImageTexture_0,
  count: 20,
  spreadAngle: 20,
}