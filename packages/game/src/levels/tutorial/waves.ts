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

  const wave1: Wave.Config = {
    waitAllEnemiesDead: true,
    spawns: [
      { delay: 2000, state: { x, y: y(3), vx: -2, type: Enemy.Type.HARE } },
    ],
  }

  const wave2: Wave.Config = {
    waitAllEnemiesDead: true,
    spawns: [
      { delay: 1000, state: { x, y: y(3), vx: -2, type: Enemy.Type.SQUIREEL } },
      { delay: 4000, state: { x, y: y(2), vx: -2, type: Enemy.Type.SQUIREEL } },
      { delay: 0, state: { x, y: y(4), vx: -2, type: Enemy.Type.SQUIREEL } },
    ],
  }

  return [
    wave1,
    wave2
  ];
}