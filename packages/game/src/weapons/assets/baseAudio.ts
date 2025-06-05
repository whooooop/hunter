import { Audio } from "../../types";
import BoltAudioUrl from './audio/base_bolt_weapon_0.mp3';
import EmptyAudioUrl from './audio/base_empty_weapon_0.mp3';
import ShootAudioUrl from './audio/base_shoot_weapon_0.mp3';

export const BaseEmptyAudio: Audio.Asset = {
  key: 'base_empty_weapon_0',
  url: EmptyAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseBoltAudio: Audio.Asset = {
  key: 'base_bolt_weapon_0',
  url: BoltAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseBoltAudio2: Audio.Asset = {
  key: 'base_bolt_audio_2',
  url: BoltAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseShootAudio: Audio.Asset = {
  key: 'base_shoot_weapon_0',
  url: ShootAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}