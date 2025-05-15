import { Wave } from '../../core/types/WaveTypes'
import { Enemy } from "../../core/types/enemyTypes";
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
    // {
    //   waitAllEnemiesDead: true,
    //   spawns: [
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.HARE,
    //       config: { x, y: 350, velocityX: -2 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.HARE,
    //       config: { x, y: 550, velocityX: -3 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.SQUIREEL,
    //       config: { x, y: 260, velocityX: -2.5 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.SQUIREEL,
    //       config: { x, y: 650, velocityX: -3.5 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.SQUIRREL_ANGRY,
    //       config: { x, y: 290, velocityX: -2.5 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.SQUIRREL_ANGRY,
    //       config: { x, y: 490, velocityX: -1.5 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.HEDGEHOG,
    //       config: { x, y: 650, velocityX: -2 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.RACCOON,
    //       config: { x, y: 300, velocityX: -2 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.RACCOON,
    //       config: { x, y: 380, velocityX: -3 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.DEER,
    //       config: { x, y: 300, velocityX: -3 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.DEER,
    //       config: { x, y: 400, velocityX: -2 },
    //     },
        
    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.WOLF,
    //       config: { x, y: 340, velocityX: -3.5 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.WOLF,
    //       config: { x, y: 440, velocityX: -3.5 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.DEER_BABY,
    //       config: { x, y: 290, velocityX: -1, velocityY: 0 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.DEER_BABY,
    //       config: { x, y: 490, velocityX: -2, velocityY: 0 },
    //     },

    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.CAPIBARA,
    //       config: { x, y: 350, velocityX: -4, velocityY: 0.3 },
    //     },


    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.MOUSE,
    //       config: { x, y: 250, velocityX: -1, velocityY: 0 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.MOUSE,
    //       config: { x, y: 450, velocityX: -2, velocityY: 0 },
    //     },

       
    //     {
    //       delay: 5000,
    //       enemyType: Enemy.Type.HEDGEHOG,
    //       config: { x, y: 250, velocityX: -1 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.HEDGEHOG,
    //       config: { x, y: 350, velocityX: 1, velocityY: -0.3 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.HEDGEHOG,
    //       config: { x, y: 450, velocityX: -1, velocityY: -0.3 },
    //     },
    //     {
    //       delay: 0,
    //       enemyType: Enemy.Type.HEDGEHOG,
    //       config: { x, y: 550, velocityX: -1, velocityY: -0.3 },
    //     },


    //     {
    //       delay: 5000,
    //       boss: true,
    //       enemyType: Enemy.Type.BEAR,
    //       config: { x, y: 250, velocityX: -3, health: 1000 },
    //     },
    //   ],
    // },
    // Wave 1
    {
      waitAllEnemiesDead: true,
      spawns: [
        { delay: 4000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 4000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 4000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 3000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 3000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(1), velocityX: -3 }, enemyType: Enemy.Type.HARE },
        { delay: 3000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(5), velocityX: -3 }, enemyType: Enemy.Type.HARE },
        { delay: 3000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(5), velocityX: -3 }, enemyType: Enemy.Type.HARE },

        { delay: 5000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(5), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(3), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 3000, config: { x, y: y(4), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 4000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(3), velocityX: -3, velocityY: 0.5 }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2000, config: { x, y: y(5), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(2), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 1000, config: { x, y: y(1), velocityX: -2 }, enemyType: Enemy.Type.HARE },
        { delay: 2000, config: { x, y: y(1), velocityX: -3, velocityY: 0.7 }, enemyType: Enemy.Type.HARE },

        { delay: 5000, config: { x, y: y(2), velocityX: -4, velocityY: -1 }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 2000, config: { x, y: y(3), velocityX: -3, velocityY: 1 }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(5), velocityX: -4, }, enemyType: Enemy.Type.SQUIREEL },

        { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(1), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(5), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(2), velocityX: -3, }, enemyType: Enemy.Type.SQUIREEL },
        { delay: 1000, config: { x, y: y(1), velocityX: -5, }, enemyType: Enemy.Type.SQUIREEL },
        
        { 
          boss: true, delay: 2000, enemyType: Enemy.Type.BEAR,
          config: { x: x + 50, y: 400, velocityX: -1.2, },  
        },
      ],
    },

    // Wave 2
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 3000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 400,
            velocityX: -2,
          },
        },
        {
          delay: 3000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 600,
            velocityX: -2,
            velocityY: 0,
          },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 200,
            velocityX: -1.4,
            velocityY: 0,
          },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 300,
            velocityX: -1,
            velocityY: 0,
          },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 500,
            velocityX: -1.2,
            velocityY: 0,
          },
        },
      ],
    },

    // Wave 3
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 3000,
          enemyType: Enemy.Type.HARE,
          config: { 
            x,
            y: 400,
            velocityX: -1,
            velocityY: 0,
          },
        },
      ],
    },
  ]
}