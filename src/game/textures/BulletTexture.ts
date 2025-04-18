import { ImageTexture } from "../core/types/texture";
import { hexToNumber } from "../utils/colors";

export const BulletImageTexture_0: ImageTexture = {
  key: 'bullet_texture_0',
  url: '', 
  scale: 0.5,
}

export const createBulletTexture = (scene: Phaser.Scene, name: string, width: number = 200, height: number = 4, color: string = '#b7f191'): void => {
  // Проверяем, существует ли уже такая текстура
  if (scene.textures.exists(name)) {
    scene.textures.remove(name);
  }

  const graphics = scene.add.graphics();
  const textureColor = hexToNumber(color);  

  graphics.fillStyle(textureColor, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height,height / 2);
  graphics.generateTexture(name, width, height);
  graphics.destroy();
}; 