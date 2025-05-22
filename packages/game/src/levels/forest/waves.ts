import { Wave } from '../../types/WaveTypes'
import { Enemy } from "../../types/enemyTypes";
import { DISPLAY } from "../../config";

export function createWavesConfig(): Wave.Config[] {
  const x = DISPLAY.WIDTH;
  const minY = 150;
  const maxY = DISPLAY.HEIGHT - 50;
  const y = (r: 1 | 2 | 3 | 4 | 5) => {
    const zoneSize = (maxY - minY) / 5;
    const zoneStart = minY + zoneSize * (r - 1);
    const zoneEnd = zoneStart + zoneSize;
    return Phaser.Math.Between(Math.floor(zoneStart), Math.floor(zoneEnd));
  }
  return [
    // Wave 1
    // {
    //   waitAllEnemiesDead: true,
    //   spawns: [
    //     { delay: 4000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 4000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 4000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 3000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 3000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 2000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(1), velocityX: -3 }, enemyType: Enemy.Type.HARE },
    //     { delay: 3000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(5), velocityX: -3 }, enemyType: Enemy.Type.HARE },
    //     { delay: 3000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(5), velocityX: -3 }, enemyType: Enemy.Type.HARE },

    //     { delay: 5000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 2000, config: { x, y: y(5), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(3), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 3000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 4000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(3), velocityX: -3, velocityY: 0.5 }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 2000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 2000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 1000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
    //     { delay: 2000, config: { x, y: y(1), velocityX: -3, velocityY: 0.7 }, enemyType: Enemy.Type.HARE },

    //     { delay: 5000, config: { x, y: y(2), velocityX: -4, velocityY: -1 }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 2000, config: { x, y: y(3), velocityX: -3, velocityY: 1 }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(5), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },

    //     { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(5), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
    //     { delay: 1000, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        
    //     { 
    //       boss: true, delay: 3000, enemyType: Enemy.Type.DEER,
    //       config: { x: x + 50, y: 400, velocityX: -4, },  
    //     },
    //   ],
    // },

    // Wave 2
    {
      waitAllEnemiesDead: true,
      spawns: [
        { delay: 2500, config: { x, y: y(3), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2500, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2500, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2000, config: { x, y: y(3), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },

        { delay: 2000, config: { x, y: y(2), velocityX: -6, }, enemyType: Enemy.Type.CAPIBARA },
        { delay: 0, config: { x, y: y(4), velocityX: -6, }, enemyType: Enemy.Type.CAPIBARA },

        { delay: 2500, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1500, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1500, config: { x, y: y(4), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1500, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(3), velocityX: -3 }, enemyType: Enemy.Type.HARE },

        { delay: 2000, config: { x, y: y(2), velocityX: -7, }, enemyType: Enemy.Type.WOLF },
        { delay: 0, config: { x, y: y(4), velocityX: -7, }, enemyType: Enemy.Type.WOLF },

        { delay: 1500, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2000, config: { x, y: y(3), velocityX: -5, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(5), velocityX: -3 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(3), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1500, config: { x, y: y(4), velocityX: -3 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(5), velocityX: -5, }, enemyType: Enemy.Type.SQUIREEL },

        { delay: 1000, config: { x, y: y(1), velocityX: -6, }, enemyType: Enemy.Type.CAPIBARA },
        { delay: 1000, config: { x, y: y(4), velocityX: -7, }, enemyType: Enemy.Type.WOLF },
        { delay: 1500, config: { x, y: y(3), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2000, config: { x, y: y(1), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1500, config: { x, y: y(5), velocityX: -5, }, enemyType: Enemy.Type.CAPIBARA },
        { delay: 2000, config: { x, y: y(2), velocityX: -5, }, enemyType: Enemy.Type.CAPIBARA },
        { delay: 1000, config: { x, y: y(3), velocityX: -6, }, enemyType: Enemy.Type.WOLF },
        { delay: 1500, config: { x, y: y(1), velocityX: -5, }, enemyType: Enemy.Type.CAPIBARA },

        { delay: 5000, config: { x, y: y(1), velocityX: -2, velocityY: 0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 100, config: { x, y: y(2), velocityX: -2, velocityY: 0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 100, config: { x, y: y(3), velocityX: -2, velocityY: -0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 100, config: { x, y: y(4), velocityX: -2, velocityY: -0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 100, config: { x, y: y(5), velocityX: -2, velocityY: 0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 400, config: { x, y: y(1), velocityX: -2, velocityY: -0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 400, config: { x, y: y(2), velocityX: -2, velocityY: 0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 400, config: { x, y: y(3), velocityX: -2, velocityY: -0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 400, config: { x, y: y(4), velocityX: -2, velocityY: 0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
        { delay: 400, config: { x, y: y(5), velocityX: -2, velocityY: -0.5 }, enemyType: Enemy.Type.HEDGEHOG, boss: true },
      ],
    },

    // Wave 3
    {
      waitAllEnemiesDead: true,
      spawns: [
       
      ],
    },
  ]
}