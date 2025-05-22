import { introFontBold, introFontRegular } from "./assets/fonts/intro";

export const DISPLAY = {
  WIDTH: 1280,
  HEIGHT: 720,
};

export const OBJECTS_DEPTH_OFFSET = 1;

export const FONT_FAMILY = {
  REGULAR: introFontRegular.name,
  BOLD: introFontBold.name,
};

export const DEBUG = {
  PHYSICS: true,
  ENEMIES: false,
  MOTION: true,
  LOCATION: true,
  SHOP: true,
  PROJECTILES: true,
};

export const GAMEOVER = false;
export const START_SCENE_GAMEPLAY = true;

export const VERSION = '0.0.3 Alpha'; 