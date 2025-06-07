import { Audio } from "../../types";
import BoltAudioUrl from './audio/base_bolt_weapon_1.mp3';
import BoltAudioUrl2 from './audio/base_bolt_weapon_2.mp3';
import BoltAudioUrl3 from './audio/base_bolt_weapon_3.mp3';
import EmptyAudioUrl from './audio/base_empty_weapon_0.mp3';
import ReloadItemAudioUrl from './audio/base_reload_item_weapon_0.mp3';
import ReloadStartAudioUrl from './audio/base_reload_start_weapon_0.mp3';
import ReloadAudioUrl from './audio/base_reload_weapon_0.mp3';
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
  url: BoltAudioUrl2,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseBoltAudio3: Audio.Asset = {
  key: 'base_bolt_audio_3',
  url: BoltAudioUrl3,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseShootAudio: Audio.Asset = {
  key: 'base_shoot_weapon_0',
  url: ShootAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseReloadAudio: Audio.Asset = {
  key: 'base_reload_weapon_0',
  url: ReloadAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseReloadStartAudio: Audio.Asset = {
  key: 'base_reload_start_weapon_0',
  url: ReloadStartAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}

export const BaseReloadItemAudio: Audio.Asset = {
  key: 'base_reload_item_weapon_0',
  url: ReloadItemAudioUrl,
  type: Audio.Type.Effect,
  volume: 1,
}