import { SceneKeys } from '../index';
import { SceneBackground } from '../../ui/SceneBackground';

export class MultiplayerScene extends Phaser.Scene {
  private sceneBackground!: SceneBackground;

  constructor() {
    super({ key: SceneKeys.MULTIPLAYER });
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