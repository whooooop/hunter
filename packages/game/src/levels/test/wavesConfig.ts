import { Wave } from '../../types/WaveTypes'
import { Enemy } from "../../types/enemyTypes";
import { DISPLAY } from "../../config";

export function createWavesConfig(): Wave.Config[] {
  const x = DISPLAY.WIDTH + 50;

  return [
    // Wave 1
    {
      waitAllEnemiesDead: false,
      spawns: [
        {
          delay: 0,
          enemyType: Enemy.Type.HARE,
          config: {
            x,
            y: 300,
            velocityX: -1,
            velocityY: 0,
          },
        }
      ],
    },
  ]
} 