import { BaseTree } from "./BaseTree";

import treeImage from '../assets/images/tree2.png';

interface Options {
    scale: number;
    health: number;
}

const TEXTURE = {
  key: 'tree_birch_texture',
  scale: 0.5,
  frameWidth: 184,
  frameHeight: 238,
}

export class BirchTree extends BaseTree {
    constructor(scene: Phaser.Scene, id: string, x: number, y: number, options: Options) {
        super(scene, id, x, y, {
            texture: TEXTURE.key,
            scale: options.scale * TEXTURE.scale,
            health: options.health,
            depthOffset: -26
        });
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.spritesheet(TEXTURE.key, treeImage, { frameWidth: TEXTURE.frameWidth, frameHeight: TEXTURE.frameHeight });
        BaseTree.preload(scene);
    }

    protected calculateFrameIndex(healthPercent: number): number {
        // При 100% здоровья (healthPercent = 1) должен быть кадр 0 (первый)
        // При 0% здоровья (healthPercent = 0) должен быть кадр 4 (последний)
        
        if (healthPercent >= 0.8) {
            return 0; // 80-100% здоровья - первый кадр (неповрежденное)
        // } else if (healthPercent >= 0.6) {
        //     return 1; // 60-80% здоровья - второй кадр (слегка поврежденное)
        } else if (healthPercent >= 0.4) {
            return 1; // 40-60% здоровья - третий кадр (умеренно поврежденное)
        // } else if (healthPercent > 0) {
            // return 3; // 20-40% здоровья - четвертый кадр (сильно поврежденное)
        } else {
            return 2; // 0-20% здоровья - пятый кадр (разрушенное)
        }
    }
}