import { LocationType } from '../../core/Constants';

// Интерфейс для цвета RGB
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ForestLocationConfig {
  background: string;
  obstacles?: {
    texture: string;
    positions: Array<{ x: number, y: number }>;
  }[];
  music?: string;
  ambientSounds?: string[];
  grassColor: RGB; // Добавляем свойство для цвета травы в шейдере
}

// Цвета для фона
export const FOREST_COLORS = {
  skyColor: 0x70b8bd,  // Небо
  grassColor: 0x7dc478 // Трава
};

// Преобразование HEX цвета в RGB объект
function hexToRgb(hex: number): RGB {
  return {
    r: (hex >> 16) & 0xFF,
    g: (hex >> 8) & 0xFF,
    b: hex & 0xFF
  };
}

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
  grassColor: hexToRgb(FOREST_COLORS.grassColor) // Конвертируем HEX в RGB
}; 