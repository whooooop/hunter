import { Wave } from '../../core/types/WaveTypes'
import { Enemy } from "../../core/types/enemyTypes";
import { DISPLAY } from "../../config";

export function createWavesConfig(): Wave.Config[] {
  const rightStartPointX = DISPLAY.WIDTH + 50;

  return [
    // Wave 1
    {
      waitAllEnemiesDead: false,
      spawns: [
        {
          delay: 0,
          enemyType: Enemy.Type.RABBIT,
          spawnConfig: { 
            x: rightStartPointX,
            y: 300,
            velocityX: -1,
            velocityY: 0,
          },
        }
      ],
    },
  ]
} 