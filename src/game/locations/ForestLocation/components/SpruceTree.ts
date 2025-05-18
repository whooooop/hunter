import { generateStringWithLength } from "../../../../utils/stringGenerator";
import { BaseTree } from "./BaseTree";
import { preloadSpriteSheet } from "../../../core/preload";
import treeImage from '../assets/images/tree.png';

interface SpruceTreeOptions {
    scale: number;
    health: number;
}

const TEXTURE = 'tree_' + generateStringWithLength(6);

export class SpruceTree extends BaseTree {
    constructor(scene: Phaser.Scene, id: string, x: number, y: number, options: SpruceTreeOptions) {
        super(scene, id, x, y, {
            texture: TEXTURE,
            scale: options.scale,
            health: options.health,
            depthOffset: -7
        });
    }

    static preload(scene: Phaser.Scene): void {
      preloadSpriteSheet(scene, { key: TEXTURE, url: treeImage, frameWidth: 76, frameHeight: 98 });
      BaseTree.preload(scene);
    }

    protected calculateFrameIndex(healthPercent: number): number {
        // При 100% здоровья (healthPercent = 1) должен быть кадр 0 (первый)
        // При 0% здоровья (healthPercent = 0) должен быть кадр 4 (последний)
        
        if (healthPercent >= 0.8) {
            return 0; // 80-100% здоровья - первый кадр (неповрежденное)
        } else if (healthPercent >= 0.6) {
            return 1; // 60-80% здоровья - второй кадр (слегка поврежденное)
        } else if (healthPercent >= 0.4) {
            return 2; // 40-60% здоровья - третий кадр (умеренно поврежденное)
        } else if (healthPercent > 0) {
            return 3; // 20-40% здоровья - четвертый кадр (сильно поврежденное)
        } else {
            return 4; // 0-20% здоровья - пятый кадр (разрушенное)
        }
    }
}