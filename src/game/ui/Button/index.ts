import ClickAudio from './click.mp3';

export const clickAudio = {
  key: 'buttonClick',
  url: ClickAudio,
}

interface Texture {
  key: string;
  scale: number;
}

export class UiButton extends Phaser.GameObjects.Image {
  static preload(scene: Phaser.Scene): void {
    scene.load.audio(clickAudio.key, clickAudio.url);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: Texture) {
    super(scene, x, y, texture.key);

    this.setScale(texture.scale);
    this.setInteractive();
    
    this.on('pointerdown', () => {
      this.setScale(texture.scale * 1); 
      scene.sound.play(clickAudio.key);
    });
    this.on('pointerup', () => {
      this.setScale(texture.scale * 1.1);
    });
    this.on('pointerover', () => {
      this.setScale(texture.scale * 1.1);
    });
    this.on('pointerout', () => {
      this.setScale(texture.scale * 1);
    });
  }
}