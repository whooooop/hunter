import { hexToNumber } from '../../utils/colors';
import { CloudOptions } from '../../ui/Clouds';
import { TREE_TYPES } from './components';

export const FOREST_COLORS = {
  skyColor: hexToNumber('#70b8bd'),  // Небо
  grassColor: hexToNumber('#43C774') // Трава
};

export const CLOUDS: CloudOptions[] = [
  { position: [120, 90], scale: 0.5, alpha: 1, speed: 0.2, depth: 1, direction: 1 },
  { position: [300, 80], scale: 0.7, alpha: 1, speed: 0.15, depth: 3, direction: -1 },
  { position: [550, 40], scale: 0.4, alpha: 1, speed: 0.3, depth: 5, direction: 1 },
  { position: [800, 50], scale: 0.8, alpha: 1, speed: 0.1, depth: 3, direction: -1 },
  { position: [1000, 90], scale: 0.6, alpha: 1, speed: 0.25, depth: 4, direction: 1 },
  { position: [1250, 70], scale: 0.5, alpha: 0.6, speed: 0.2, depth: 5, direction: -1 }
];

export const INTERACTIVE_OBJECTS = [
  { id: 'object_spruce_1', type: TREE_TYPES.SPRUCE, position: [1100, 190], scale: 1, health: 1000 },
  { id: 'object_spruce_2', type: TREE_TYPES.SPRUCE, position: [1250, 260], scale: 1, health: 1000 },
  { id: 'object_spruce_3', type: TREE_TYPES.SPRUCE, position: [1000, 260], scale: 0.6, health: 1000 },
  { id: 'object_spruce_4', type: TREE_TYPES.SPRUCE, position: [1050, 330], scale: 0.7, health: 1000 },
  { id: 'object_spruce_5', type: TREE_TYPES.SPRUCE, position: [1080, 400], scale: 0.9, health: 1000 },
  { id: 'object_spruce_6', type: TREE_TYPES.SPRUCE, position: [1140, 430], scale: 1, health: 1000 },
  { id: 'object_spruce_7', type: TREE_TYPES.SPRUCE, position: [1180, 670], scale: 1, health: 1000 },
  { id: 'object_birch_1', type: TREE_TYPES.BIRCH, position: [1150, 210], scale: 1.2, health: 1000 },
  { id: 'object_birch_2', type: TREE_TYPES.BIRCH, position: [1100, 650], scale: 1, health: 1000 },
  { id: 'object_birch_3', type: TREE_TYPES.BIRCH, position: [1020, 450], scale: 0.8, health: 1000 },
  { id: 'object_birch_4', type: TREE_TYPES.BIRCH, position: [1170, 570], scale: 1, health: 1000 },
  { id: 'object_birch_5', type: TREE_TYPES.BIRCH, position: [1100, 500], scale: 1, health: 1000 },
  { id: 'object_birch_6', type: TREE_TYPES.BIRCH, position: [1050, 350], scale: 1, health: 1000 },
  { id: 'object_birch_7', type: TREE_TYPES.BIRCH, position: [1090, 300], scale: 1, health: 1000 },
  { id: 'object_birch_8', type: TREE_TYPES.BIRCH, position: [1180, 490], scale: 1, health: 1000 },
];
