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

// Константы для игрового мира
export const WORLD_BOUNDS = {
  width: 800,
  height: 600
};

// Константы для физики
export const PHYSICS = {
  debug: false
}; 