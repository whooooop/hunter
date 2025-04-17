import { SceneKeys } from '../index';
import { SceneBackground } from '../../ui/SceneBackground';

export class ShopScene extends Phaser.Scene {
  private sceneBackground!: SceneBackground;

  constructor() {
    super({ key: SceneKeys.SHOP });
  }
  
  preload() {
    SceneBackground.preload(this);
  }

  create() {
    this.sceneBackground = new SceneBackground(this);
  }

  update(time: number, delta: number): void {
    this.sceneBackground.update(time, delta);
  }

  back(): void {
    this.scene.start(SceneKeys.MAIN_MENU);
  }
}