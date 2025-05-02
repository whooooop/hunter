import replayButtonTextureUrl from './replay_button.png';

const texture = {
  key: 'replayButton',
  url: replayButtonTextureUrl,
  scale: 0.5,
}

export class UiReplayButton extends Phaser.GameObjects.Image {
  static preload(scene: Phaser.Scene): void {
    scene.load.image(texture.key, texture.url);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texture.key);

    this.setScale(texture.scale);
    this.setInteractive();
    
    this.on('pointerdown', () => {
      this.setScale(texture.scale * 1); 
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