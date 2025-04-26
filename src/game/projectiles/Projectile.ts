import { Projectile } from "../core/types/projectrileTypes";
import { BulletImageTexture_0, createBulletTexture } from "../textures/BulletTexture";

export const ProjectileProjectileConfig: Projectile.Config = {
  type: Projectile.Type.GRENADE,
  texture: {
    key: 'bullet_texture_0',
    generate: (scene: Phaser.Scene, key: string) => {
      createBulletTexture(scene, key, 60, 20);
    },
    scale: 0.5,
  },
  drag: 1600,
  activateDelay: 600,
  bounce: 0,
  gravity: 500,
  radius: 100,
  activateRadius: 50,
}