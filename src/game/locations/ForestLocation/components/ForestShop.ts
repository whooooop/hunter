import { DEBUG } from "../../../config";
import { BaseShop } from "../../../core/BaseShop";
import { preloadImage } from "../../../core/preload";
import shopImage from '../assets/images/shop.png';

const texture = {
  key: 'forest_location_shop_texture',
  url: shopImage,
  scale: 0.5,
}

export class ForestShop extends BaseShop {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, { 
            texture: texture.key,
            scale: texture.scale,
            interactionRadius: 100,
            depthOffset: -50,
            debug: DEBUG.SHOP
        });
    }

    static preload(scene: Phaser.Scene): void {
      preloadImage(scene, texture);
    }
}