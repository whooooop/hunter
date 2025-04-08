import * as Phaser from 'phaser';
import { BaseBullet } from '../BaseBullet';
import { hexToRgb } from '../../../utils/colors';

export class SimpleBullet extends BaseBullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
        color: hexToRgb('#b7f191'),
        width: 40,
        height: 1,
    });
  }
} 