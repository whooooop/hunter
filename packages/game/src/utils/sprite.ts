export type SpriteSheetConfig = {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frameRate?: number;
  startFrame?: number;
  endFrame?: number;
  repeat?: number;
}

export type SpriteConfig = {
  key: string;
  url: string;
  scale?: number;
}

export const loadSprite = (scene: Phaser.Scene, config: SpriteConfig) => {
  scene.load.image(config.key, config.url);
}

export const loadSpriteSheet = (scene: Phaser.Scene, config: SpriteSheetConfig) => {
  scene.load.spritesheet(config.key, config.url, { 
    frameWidth: config.frameWidth, 
    frameHeight: config.frameHeight 
  });
}

export const createSpriteAnimation = (scene: Phaser.Scene, config: SpriteSheetConfig) => {
  if (!scene.anims.exists(config.key)) {
    scene.anims.create({
      key: config.key,
      frames: scene.anims.generateFrameNames(config.key, {
        start: config.startFrame,
        end: config.endFrame
      }),
      frameRate: config.frameRate,
      repeat: config.repeat,
    });
  }
}