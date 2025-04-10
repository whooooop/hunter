import { hexToNumber } from '../../utils/colors';

export interface ForestLocationConfig {
  background: string;
  obstacles?: {
    texture: string;
    positions: Array<{ x: number, y: number }>;
  }[];
  music?: string;
  ambientSounds?: string[];
  grassColor: number; // Добавляем свойство для цвета травы в шейдере
}

// Цвета для фона
export const FOREST_COLORS = {
  skyColor: hexToNumber('#70b8bd'),  // Небо
  grassColor: hexToNumber('#7dc478') // Трава
};

// Стандартная конфигурация для локации "Лес"
export const DEFAULT_FOREST_CONFIG: ForestLocationConfig = {
  background: 'forest_background',
  obstacles: [
    {
      texture: 'tree',
      positions: [
        { x: 200, y: 150 },
        { x: 400, y: 350 },
        { x: 600, y: 250 }
      ]
    },
    {
      texture: 'rock',
      positions: [
        { x: 300, y: 450 },
        { x: 500, y: 150 }
      ]
    }
  ],
  grassColor: FOREST_COLORS.grassColor // Конвертируем HEX в RGB
}; 