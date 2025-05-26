import { Weapon } from "../../types/weaponTypes";
import EmptyAudioUrl from './audio/base_empty_weapon_0.mp3';
import BoltAudioUrl from './audio/base_bolt_weapon_0.mp3';
import ShootAudioUrl from './audio/base_shoot_weapon_0.mp3';

export const BaseEmptyAudio: Weapon.Audio.Asset = {
  key: 'base_empty_weapon_0',
  url: EmptyAudioUrl,
} 

export const BaseBoltAudio: Weapon.Audio.Asset = {
  key: 'base_bolt_weapon_0',
  url: BoltAudioUrl,
}

export const BaseBoltAudio2: Weapon.Audio.Asset = {
  key: 'base_bolt_audio_2',
  url: BoltAudioUrl,
}

export const BaseShootAudio: Weapon.Audio.Asset = {
  key: 'base_shoot_weapon_0',
  url: ShootAudioUrl,
}