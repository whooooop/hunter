import { SceneKeys } from ".";
import { preloadMenuAudio } from "../audio/menu";
import { START_SCENE_GAMEPLAY } from "../config";
import { LevelId } from "../levels";
import { UiBackButton } from "../ui/BackButton";
import { BackgroundView } from "../views/background/BackgroundView";
import { LoadingView } from "../views/loading/LoadingView";
import { MenuSceneTypes } from "./MenuScene/MenuSceneTypes";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    LoadingView.preload(this);
    BackgroundView.preload(this);
    UiBackButton.preload(this);
    preloadMenuAudio(this);
  }

  create() {
    if (START_SCENE_GAMEPLAY) {
      const gameId = new URLSearchParams(window.location.search).get('game')
      this.scene.start(SceneKeys.GAMEPLAY, {
        levelId: LevelId.FOREST,
        gameId
      });
    } else {
      this.scene.start(SceneKeys.MENU, { view: MenuSceneTypes.ViewKeys.MULTIPLAYER_CREATE });
    }
  }
}