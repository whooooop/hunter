import { settings } from "../../settings";
import { Wave } from '../../core/types/WaveTypes'
import { Enemy } from "../../core/types/enemyTypes";

export function createWavesConfig(): Wave.Config[] {
  const rightStartPointX = settings.display.width + 50;

  return [
    // Wave 1
    {
      waitAllEnemiesDead: false,
      spawns: [
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.MOUSE,
          position: [rightStartPointX, 600],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 400],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 8000,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 600],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
   
        {
          delay: 2000,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 200],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 1300,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 1500,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 2300,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 500,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.BEAR,
          position: [rightStartPointX + 50, 400],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },

    // Wave 2
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 400],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 5000,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 600],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 200],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 300,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 500,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },

    // Wave 3
    {
      waitAllEnemiesDead: true,
      spawns: [
        {
          delay: 1000,
          enemyType: Enemy.Type.RABBIT,
          position: [rightStartPointX, 400],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },
  ]
}