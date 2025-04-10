import * as Phaser from 'phaser';
import { BaseBullet } from '../../core/BaseBullet';
import { hexToNumber } from '../../utils/colors';

export class SimpleBullet extends BaseBullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
        color: hexToNumber('#b7f191'),
        width: 40,
        height: 2,
    });
  }
} 