import { DISPLAY } from "../../config";
import { UiButtonTimer } from "../../ui";
import { SceneKeys } from "../index";
import { MenuSceneTypes } from "../MenuScene/MenuSceneTypes";
import { SkipText } from "./translates";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.INTRO });
  }

  preload() {
    UiButtonTimer.preload(this);
  }

  create() {
    const button = new UiButtonTimer(this, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - 100, SkipText.translate, 10000, () => this.continue()).setScale(0.8);
    this.add.existing(button);
  }

  continue() {
    this.scene.start(SceneKeys.MENU, { view: MenuSceneTypes.ViewKeys.HOME });
  }
}