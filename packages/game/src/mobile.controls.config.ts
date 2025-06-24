import { DISPLAY } from "./config";

export const mobileMoveArea = {
  x: 0,
  y: DISPLAY.HEIGHT / 3.4,
  width: DISPLAY.WIDTH / 2,
  height: DISPLAY.HEIGHT - DISPLAY.HEIGHT / 3.4,
};

export const mobileFireArea = {
  x: DISPLAY.WIDTH / 2 + 50,
  y: DISPLAY.HEIGHT / 2.4,
  width: DISPLAY.WIDTH - DISPLAY.WIDTH / 2 - 50,
  height: DISPLAY.HEIGHT - DISPLAY.HEIGHT / 2.4,
};

export const mobileChangeWeaponArea = {
  x: DISPLAY.WIDTH / 2 + 50,
  y: 130,
  width: DISPLAY.WIDTH - DISPLAY.WIDTH / 2 - 50,
  height: 150,
};

export const MIN_THRESHOLD = 0.25;
export const FOLLOW_FINGER = true;