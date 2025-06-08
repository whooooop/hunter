import { MineImageTexture_0 } from "../textures/mineTexture";
import { Audio, Projectile } from "../types";
import ProjectileActivateAudioUrl from '../weapons/assets/audio/explosion_audio_0.mp3';

export const ProjectileMineConfig: Projectile.Config = {
  type: Projectile.Type.MINE,
  texture: MineImageTexture_0,
  radius: 80,
  activateRadius: 30,
  drag: 800,
  gravity: 600,
  activateAudio: {
    key: 'explosion_activate_audio_0',
    url: ProjectileActivateAudioUrl,
    type: Audio.Type.Effect,
    volume: 1,
  },
}