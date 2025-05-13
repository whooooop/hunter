import { Wave } from '../../core/types/WaveTypes'
import { Enemy } from "../../core/types/enemyTypes";
import { DISPLAY } from "../../config";

export function createWavesConfig(): Wave.Config[] {
  const rightStartPointX = DISPLAY.WIDTH + 50;

  return [
    // Wave 1
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 450, velocityX: -3 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.HEDGEHOG,
          spawnConfig: { x: rightStartPointX, y: 650, velocityX: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.RACCOON,
          spawnConfig: { x: rightStartPointX, y: 300, velocityX: -2 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.DEER,
          spawnConfig: { x: rightStartPointX, y: 300, velocityX: -3 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.MOUSE,
          spawnConfig: { x: rightStartPointX, y: 250, velocityX: -1, velocityY: 0.3 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.CAPIBARA,
          spawnConfig: { x: rightStartPointX, y: 350, velocityX: -4, velocityY: 0.3 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 350, velocityX: -1, health: 500 },
          boss: true,
        },
        {
          delay: 0,
          enemyType: Enemy.Type.BEAR,
          spawnConfig: { x: rightStartPointX, y: 250, velocityX: -3 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.HEDGEHOG,
          spawnConfig: { x: rightStartPointX, y: 250, velocityX: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.HEDGEHOG,
          spawnConfig: { x: rightStartPointX, y: 650, velocityX: -1, velocityY: -0.3 },
        },
      ],
    },
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 5000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 550, velocityX: -1 },
        },
        {
          delay: 5000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 350, velocityX: -1 },
        },
        {
          delay: 5000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 320, velocityX: -1 },
        },
        {
          delay: 3000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 330, velocityX: -1 },
        },
        {
          delay: 3000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 600, velocityX: -1 },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 580, velocityX: -1 },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 300, velocityX: -1.4 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 600, velocityX: -1.4 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 540, velocityX: -2.2 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 540, velocityX: -2.2 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 230, velocityX: -1.2 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 400, velocityX: -2 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 620, velocityX: -1 },
        },
   
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 400, velocityX: -1 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 330, velocityX: -1.5 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 480, velocityX: -1 },
        },
        {
          delay: 3000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 260, velocityX: -1 },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { x: rightStartPointX, y: 630, velocityX: -2 },
        },
        // {
        //   delay: 2000,
        //   enemyType: Enemy.Type.BEAR,
        //   spawnConfig: { 
        //     x: rightStartPointX + 50,
        //     y: 400,
        //     velocityX: -1.2,
        //   },
        // },
      ],
    },

    // Wave 2
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 3000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 400,
            velocityX: -2,
          },
        },
        {
          delay: 3000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 600,
            velocityX: -2,
            velocityY: 0,
          },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 200,
            velocityX: -1.4,
            velocityY: 0,
          },
        },
        {
          delay: 2000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 300,
            velocityX: -1,
            velocityY: 0,
          },
        },
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
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
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 400,
            velocityX: -1,
            velocityY: 0,
          },
        },
      ],
    },
  ]
}