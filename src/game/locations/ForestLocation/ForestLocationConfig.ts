import { hexToNumber } from '../../utils/colors';


export interface ForestLocationConfig {
  background: string;
  music?: string;
  ambientSounds?: string[];
}

// Цвета для фона
export const FOREST_COLORS = {
  skyColor: hexToNumber('#70b8bd'),  // Небо
  grassColor: hexToNumber('#43C774') // Трава
};

// Стандартная конфигурация для локации "Лес"
export const DEFAULT_FOREST_CONFIG: ForestLocationConfig = {
  background: 'forest_background',
}; 

export const CLOUDS = [
  { position: [120, 90], scale: 0.5, alpha: 1, speed: 0.2, depth: 1, direction: 1 },
  { position: [300, 80], scale: 0.7, alpha: 1, speed: 0.15, depth: 3, direction: -1 },
  { position: [550, 40], scale: 0.4, alpha: 1, speed: 0.3, depth: 5, direction: 1 },
  { position: [800, 50], scale: 0.8, alpha: 1, speed: 0.1, depth: 3, direction: -1 },
  { position: [1000, 90], scale: 0.6, alpha: 1, speed: 0.25, depth: 4, direction: 1 },
  { position: [1250, 70], scale: 0.5, alpha: 0.6, speed: 0.2, depth: 5, direction: -1 }
];

export const INTERACTIVE_OBJECTS = [
  { type: 'spruce', position: [1200, 190], scale: 0.6, health: 500 },
  { type: 'spruce', position: [1100, 380], scale: 0.7, health: 4000 },
  { type: 'spruce', position: [1050, 600], scale: 0.9, health: 1000 },
  { type: 'spruce', position: [1100, 630], scale: 0.9, health: 1000 },
];
