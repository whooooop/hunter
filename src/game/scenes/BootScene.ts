import { SceneKeys } from ".";
import { LoadingView } from "../views/loading/LoadingView";
import { BackgroundView } from "../views/background/BackgroundView";
import { UiBackButton } from "../scenes/MenuScene/ui/backButton";
import { LevelId } from "../levels";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    LoadingView.preload(this);
    BackgroundView.preload(this);
    UiBackButton.preload(this);
  }

  create() {
    // this.scene.start(SceneKeys.GAMEPLAY, { levelId: LevelId.FOREST });
    this.scene.start(SceneKeys.MENU);
  }
}