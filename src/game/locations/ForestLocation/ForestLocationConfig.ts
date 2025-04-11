import { hexToNumber } from '../../utils/colors';

export interface ForestLocationConfig {
  background: string;
  music?: string;
  ambientSounds?: string[];
}

// Цвета для фона
export const FOREST_COLORS = {
  skyColor: hexToNumber('#70b8bd'),  // Небо
  grassColor: hexToNumber('#7dc478') // Трава
};

// Стандартная конфигурация для локации "Лес"
export const DEFAULT_FOREST_CONFIG: ForestLocationConfig = {
  background: 'forest_background',
}; 

export const INTERACTIVE_OBJECTS = [
  { type: 'spruce', position: [1200, 150], scale: 0.6, health: 500 },
  { type: 'spruce', position: [1100, 380], scale: 0.7, health: 4000 },
  { type: 'spruce', position: [1050, 600], scale: 0.9, health: 1000 },
  { type: 'spruce', position: [1100, 630], scale: 0.9, health: 1000 },
];
