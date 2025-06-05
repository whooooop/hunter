import { BulletTexture } from "../textures/bullet";
import { Audio, Projectile } from "../types";
import ProjectileActivateAudioUrl from '../weapons/assets/audio/explosion_audio_0.mp3';

export const ProjectileProjectileConfig: Projectile.Config = {
  type: Projectile.Type.GRENADE,
  texture: BulletTexture,
  activateAudio: {
    key: 'explosion_activate_audio_0',
    url: ProjectileActivateAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
  rotation: -4.81,
  drag: 1600,
  activateDelay: 600,
  bounce: 0,
  gravity: 500,
  radius: 160,
  activateRadius: 40,
}