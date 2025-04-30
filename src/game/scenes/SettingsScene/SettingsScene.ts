import { SceneKeys } from '../index';
import { BackgroundView } from '../../views/background/BackgroundView';

export class SettingsScene extends Phaser.Scene {
  private backgroundView!: BackgroundView;
  private container!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: SceneKeys.SETTINGS });
  }
  
  preload() {
    BackgroundView.preload(this);
  }

  create() {
    this.container = this.add.container(0, 0).setDepth(1000);
    this.backgroundView = new BackgroundView(this, this.container);
  }

  update(time: number, delta: number): void {
    this.backgroundView.update(time, delta);
  }

  back(): void {
    this.scene.start(SceneKeys.MAIN_MENU);
  }
}