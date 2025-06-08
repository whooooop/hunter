import { DISPLAY } from "../../config";
import { Wave } from '../../types/WaveTypes';

export function createWavesConfig(): Wave.Config[] {
  const x = DISPLAY.WIDTH + 50;

  return [
    // Wave 1
    {
      waitAllEnemiesDead: false,
      spawns: [],
    },
  ]
} 
