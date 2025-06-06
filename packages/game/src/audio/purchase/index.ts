import { AudioService } from '../../services/AudioService';
import { Audio } from '../../types';
import purchaseSoundUrl from './assets/purchase.mp3';

export const PurchaseSound: Audio.Asset = {
  url: purchaseSoundUrl,
  key: 'purchase_sound',
  volume: 1,
  type: Audio.Type.Effect
};

export const preloadPurchaseSound = (scene: Phaser.Scene) => {
  AudioService.preloadAsset(scene, PurchaseSound);
};
