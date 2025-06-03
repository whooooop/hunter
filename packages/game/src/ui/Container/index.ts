import { FONT_FAMILY } from '../../config';
import { preloadImage } from '../../preload';
import containerTextureUrl from './assets/container.png';
import titleTextureUrl from './assets/title.png';

const containerTexture = {
  url: containerTextureUrl,
  key: 'container_texture',
  scale: 0.5,
}

const titleTexture = {
  url: titleTextureUrl,
  key: 'container_title_texture',
  scale: 0.5,
}

export class UiContainer extends Phaser.GameObjects.Container {

  public background!: Phaser.GameObjects.Image;
  public title!: Phaser.GameObjects.Image;
  public text!: Phaser.GameObjects.Text;

  static preload(scene: Phaser.Scene): void {
    preloadImage(scene, { key: containerTexture.key, url: containerTexture.url });
    preloadImage(scene, { key: titleTexture.key, url: titleTexture.url });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, titleText: string) {
    super(scene, x, y);
    this.createBackground();
    this.createTitle(titleText);
  }

  private createBackground(): void {
    this.background = this.scene.add.image(0, 0, containerTexture.key).setScale(containerTexture.scale);
    this.add(this.background);
  }

  private createTitle(titleText: string): void {
    const titleContainer = this.scene.add.container(150, -270);
    this.title = this.scene.add.image(0, 0, titleTexture.key).setScale(titleTexture.scale);
    this.text = this.scene.add.text(0, 0, titleText.toUpperCase(), { fontSize: 70, fontFamily: FONT_FAMILY.BOLD, color: '#ffffff' }).setScale(titleTexture.scale).setOrigin(0.5);
    titleContainer.add(this.title);
    titleContainer.add(this.text);
    this.add(titleContainer);
  }
}