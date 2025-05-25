import { DISPLAY } from "../../config";
import { Enemy, Wave } from "../../types";

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
    {
      waitAllEnemiesDead: true,
      spawns: [
        { delay: 2000, state: { x, y: y(5), vx: -2, type: Enemy.Type.HARE } },
        { delay: 4000, state: { x, y: y(1), vx: -2, type: Enemy.Type.HARE } },
        { delay: 4000, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 3000, state: { x, y: y(1), vx: -2, type: Enemy.Type.HARE } },
        { delay: 3000, state: { x, y: y(5), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(4), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(1), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(5), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(1), vx: -3, type: Enemy.Type.HARE } },
        { delay: 3000, state: { x, y: y(4), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(5), vx: -3, type: Enemy.Type.HARE } },
        { delay: 3000, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(5), vx: -3, type: Enemy.Type.HARE } },

        { delay: 5000, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(5), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(3), vx: -2, type: Enemy.Type.HARE } },
        { delay: 3000, state: { x, y: y(4), vx: -2, type: Enemy.Type.HARE } },
        { delay: 4000, state: { x, y: y(1), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(3), vx: -3, vy: 0.5, type: Enemy.Type.SQUIREEL } },
        { delay: 2000, state: { x, y: y(5), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(1), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(1), vx: -3, vy: 0.7, type: Enemy.Type.HARE } },

        { delay: 5000, state: { x, y: y(2), vx: -4, vy: -1, type: Enemy.Type.SQUIREEL } },
        { delay: 2000, state: { x, y: y(3), vx: -3, vy: 1, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(5), vx: -4, type: Enemy.Type.SQUIREEL } },

        { delay: 1000, state: { x, y: y(1), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(2), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(1), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(2), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(5), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(2), vx: -3, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },

        {
          delay: 3000, state: { x, y: y(3), vx: -4, type: Enemy.Type.DEER, boss: true },
        },
      ],
    },

    // Wave 2
    {
      waitAllEnemiesDead: true,
      spawns: [
        { delay: 2500, state: { x, y: y(3), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2500, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 2500, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(4), vx: -2, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 2000, state: { x, y: y(3), vx: -4, type: Enemy.Type.SQUIREEL } },

        { delay: 2000, state: { x, y: y(2), vx: -6, type: Enemy.Type.CAPIBARA } },
        { delay: 0, state: { x, y: y(4), vx: -6, type: Enemy.Type.CAPIBARA } },

        { delay: 2500, state: { x, y: y(1), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1500, state: { x, y: y(2), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 1500, state: { x, y: y(4), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 1500, state: { x, y: y(5), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(3), vx: -3, type: Enemy.Type.HARE } },

        { delay: 2000, state: { x, y: y(2), vx: -7, type: Enemy.Type.WOLF } },
        { delay: 0, state: { x, y: y(4), vx: -7, type: Enemy.Type.WOLF } },

        { delay: 1500, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 2000, state: { x, y: y(3), vx: -5, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(5), vx: -3, type: Enemy.Type.HARE } },
        { delay: 2000, state: { x, y: y(3), vx: -2, type: Enemy.Type.HARE } },
        { delay: 1500, state: { x, y: y(4), vx: -3, type: Enemy.Type.HARE } },
        { delay: 1000, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 1000, state: { x, y: y(5), vx: -5, type: Enemy.Type.SQUIREEL } },

        { delay: 1000, state: { x, y: y(1), vx: -6, type: Enemy.Type.CAPIBARA } },
        { delay: 1000, state: { x, y: y(4), vx: -7, type: Enemy.Type.WOLF } },
        { delay: 1500, state: { x, y: y(3), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 2000, state: { x, y: y(1), vx: -4, type: Enemy.Type.SQUIREEL } },
        { delay: 1500, state: { x, y: y(5), vx: -5, type: Enemy.Type.CAPIBARA } },
        { delay: 2000, state: { x, y: y(2), vx: -5, type: Enemy.Type.CAPIBARA } },
        { delay: 1000, state: { x, y: y(3), vx: -6, type: Enemy.Type.WOLF } },
        { delay: 1500, state: { x, y: y(1), vx: -5, type: Enemy.Type.CAPIBARA } },

        { delay: 5000, state: { x, y: y(1), vx: -2, vy: 0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 100, state: { x, y: y(2), vx: -2, vy: 0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 100, state: { x, y: y(3), vx: -2, vy: -0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 100, state: { x, y: y(4), vx: -2, vy: -0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 100, state: { x, y: y(5), vx: -2, vy: 0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 400, state: { x, y: y(1), vx: -2, vy: -0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 400, state: { x, y: y(2), vx: -2, vy: 0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 400, state: { x, y: y(3), vx: -2, vy: -0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 400, state: { x, y: y(4), vx: -2, vy: 0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
        { delay: 400, state: { x, y: y(5), vx: -2, vy: -0.5, type: Enemy.Type.HEDGEHOG, boss: true } },
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