import { hexToNumber } from "../utils/colors";

// Ключи сцен
export enum SceneKeys {
  LOADING = 'loading',
  MENU = 'menu',
  GAMEPLAY = 'gameplay',
  GAME_OVER = 'gameOver'
}

// Константы для игрока
export const PLAYER_SPEED = 200;
export const PLAYER_POSITION_X = 100;
export const PLAYER_POSITION_Y = 300;

// Типы оружия
export enum WeaponType {
  PISTOL = 'pistol',
  RIFLE = 'rifle'
}

// Типы врагов
export enum EnemyType {
  SQUIRREL = 'squirrel',
  MOOSE = 'moose',
  BEAR = 'bear'
}

// Типы локаций
export enum LocationType {
  FOREST = 'forest'
}

// Константы для физики
export const PHYSICS = {
  debug: false
}; 

export const COLORS = {
  INTERFACE_BLOCK_BACKGROUND: '#06232d',
  INTERFACE_BLOCK_TEXT: '#ffffff',

  INTERACTIVE_BUTTON_BACKGROUND: '#fbb52f',
  INTERACTIVE_BUTTON_TEXT: '#ffffff'
}