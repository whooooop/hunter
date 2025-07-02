import { introFontBold, introFontRegular } from "./assets/fonts/intro";

export const DISPLAY = {
  WIDTH: 1280,
  HEIGHT: 720,
};

export const OBJECTS_DEPTH_OFFSET = 1;

export const LOADING_EXTRA_DURATION = 3000;
export const MULTIPLAYER_EXTRA_DURATION = 1000;

export const FONT_FAMILY = {
  REGULAR: introFontRegular.name,
  BOLD: introFontBold.name,
};

export const DEBUG = {
  PHYSICS: false,
  ENEMIES: false,
  MOTION: false,
  LOCATION: false,
  SHOP: false,
  PROJECTILES: false,
  QIEST: false,
};

export const GAMEOVER = true;
export const START_SCENE_GAMEPLAY = false;
export const PAUSE_WHEN_FOCUS_LOST = true;

export const VERSION = '1.8.0 Beta'; 