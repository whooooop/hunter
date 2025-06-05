import { GrenadeImageTexture_0 } from "../textures/GrenadeTexture";
import { Audio, Projectile } from "../types";
import ProjectileActivateAudioUrl from '../weapons/assets/audio/explosion_audio_0.mp3';

export const ProjectileGrenadeConfig: Projectile.Config = {
  type: Projectile.Type.GRENADE,
  texture: GrenadeImageTexture_0,
  drag: 1200,
  activateDelay: 1200,
  bounce: 1,
  gravity: 600,
  radius: 160,
  activateAudio: {
    key: 'explosion_activate_audio_0',
    url: ProjectileActivateAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
}
