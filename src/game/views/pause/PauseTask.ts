import { settings } from "../../settings";
import { UiStar } from "../../ui/Star";
import { TaskBgTexture, TaskDoneTexture, TaskNumberTexture, TaskOkTexture } from "./textures";

export class PauseTask extends Phaser.GameObjects.Container {
  static preload(scene: Phaser.Scene) {
    UiStar.preload(scene);
    
    scene.load.image(TaskBgTexture.key, TaskBgTexture.url);
    scene.load.image(TaskDoneTexture.key, TaskDoneTexture.url);
    scene.load.image(TaskNumberTexture.key, TaskNumberTexture.url);
    scene.load.image(TaskOkTexture.key, TaskOkTexture.url);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, title: string, number: number, done: boolean, stars: number) {
    super(scene, x, y);

    const bkTexture = done ? TaskDoneTexture : TaskBgTexture;
    const numberTexture = done ? TaskOkTexture : TaskNumberTexture;

    const block = scene.add.image(0, 0, bkTexture.key).setOrigin(0.5).setScale(bkTexture.scale);
    const numberImage = scene.add.image(-170, 3, numberTexture.key).setOrigin(0.5).setScale(numberTexture.scale);
    const numberText = scene.add.text(-170, 0, number.toString(), { fontSize: 24, color: '#fff', fontFamily: settings.fontFamily, stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
    const text = scene.add.text(-130, 0, title.toUpperCase(), { fontSize: 20, color: '#fff', fontFamily: settings.fontFamily, stroke: '#000', strokeThickness: 3 }).setOrigin(0, 0.5).setWordWrapWidth(270);

    this.add(block);
    this.add(numberImage);
    this.add(text);

    if (!done) {
      this.add(numberText);
    }

    const starsContainer = new UiStar(scene, 160, 0, stars);
    this.add(starsContainer);
  }
}