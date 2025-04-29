import { Projectile } from "../core/types/projectrileTypes";
import { createBulletTexture } from "../textures/BulletTexture";
import ProjectileActivateAudioUrl from '../weapons/assets/audio/explosion_audio_0.mp3';

export const ProjectileProjectileConfig: Projectile.Config = {
  type: Projectile.Type.GRENADE,
  texture: {
    key: 'projectile_texture_0',
    generate: (scene: Phaser.Scene, key: string) => {
      createBulletTexture(scene, key, 60, 20);
    },
    scale: 0.5,
  },
  activateAudio: {
    key: 'explosion_activate_audio_0',
    url: ProjectileActivateAudioUrl,
  },
  drag: 1600,
  activateDelay: 600,
  bounce: 0,
  gravity: 500,
  radius: 100,
  activateRadius: 26,
}