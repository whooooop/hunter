import { Projectile } from "../core/types/projectrileTypes";
import { GrenadeImageTexture_0 } from "../textures/GrenadeTexture";

export const ProjectileGrenadeConfig: Projectile.Config = {
  type: Projectile.Type.GRENADE,
  texture: GrenadeImageTexture_0,
  drag: 1200,
  activateDelay: 1200,
  bounce: 1,
  gravity: 600,
  radius: 100,
}
