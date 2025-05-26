import { SceneKeys } from ".";

export class ReloadScene extends Phaser.Scene {
  private sceneKey!: SceneKeys;
  private payload!: any;
  constructor() {
    super({ key: SceneKeys.RELOAD });
  }

  init({ sceneKey, payload }: { sceneKey: SceneKeys, payload: any }) {
    this.sceneKey = sceneKey;
    this.payload = payload;
  }

  create() {
    this.scene.start(this.sceneKey, this.payload);
  }
}