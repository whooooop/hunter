import { MenuSceneTypes } from "../../MenuSceneTypes";

export interface MenuButton {
  key: string;
  text: string;
  texture: { key: string, url: string, scale: number };
  position: { x: number, y: number };
  leaveOffset: { x: number, y: number };
  textOffset: [number, number]; 
  viewKey: MenuSceneTypes.ViewKeys;
  delay: number;
}