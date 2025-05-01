import { SceneKeys } from ".";
import { LoadingView } from "../views/loading/LoadingView";
import { Location } from "../core/types/Location";
import { BackgroundView } from "../views/background/BackgroundView";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    LoadingView.preload(this);
    BackgroundView.preload(this);
  }

  create() {
    // this.scene.start(SceneKeys.GAMEPLAY, { locationId: Location.Id.FOREST });
    this.scene.start(SceneKeys.SELECT_MAP);
    // this.scene.start(SceneKeys.MAIN_MENU);
  }
}