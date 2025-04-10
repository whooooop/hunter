import { generateStringWithLength } from "../../../../utils/stringGenerator";
import { BaseShop } from "../../../core/BaseShop";
import shopImage from '../assets/images/shop.png';

const TEXTURE_SHOP = 'shop_' + generateStringWithLength(6);

export class ForestShop extends BaseShop {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, { 
            texture: TEXTURE_SHOP,
            scale: 0.5,
            interactionRadius: 100,
            debug: true,
            depthOffset: 20
        });
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE_SHOP, shopImage);
    }
}