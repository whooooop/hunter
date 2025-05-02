import { CloudOptions, Clouds } from "../../ui/Clouds";
import { mountainTexture_1, mountainTexture_2, mountainTexture_3 } from "./textures";
import { groundTexture } from "./textures";
import { skyTexture } from "./textures";

const defaultOptions: BackgroundViewOptions = {
  clouds: [
    { position: [120, 90], scale: 0.5, alpha: 1, speed: 0.2, depth: 9, direction: 1 },
    { position: [300, 80], scale: 0.7, alpha: 1, speed: 0.15, depth: 16, direction: -1 },
    { position: [550, 40], scale: 0.4, alpha: 1, speed: 0.3, depth: 21, direction: 1 },
    { position: [800, 50], scale: 0.8, alpha: 1, speed: 0.1, depth: 26, direction: -1 },
    { position: [1000, 90], scale: 0.6, alpha: 1, speed: 0.25, depth: 11, direction: 1 },
    { position: [1250, 70], scale: 0.5, alpha: 0.6, speed: 0.2, depth: 25, direction: -1 }
  ],
}

interface BackgroundViewOptions {
  clouds: CloudOptions[];
}

export class BackgroundView {
  private scene: Phaser.Scene;
  private clouds!: Clouds;
  private options: BackgroundViewOptions;
  private container: Phaser.GameObjects.Container;

  static preload(scene: Phaser.Scene) {
    scene.load.image(skyTexture.key, skyTexture.url);
    scene.load.image(groundTexture.key, groundTexture.url);
    scene.load.image(mountainTexture_1.key, mountainTexture_1.url);
    scene.load.image(mountainTexture_2.key, mountainTexture_2.url);
    scene.load.image(mountainTexture_3.key, mountainTexture_3.url);   
    Clouds.preload(scene);
  }

  constructor(scene: Phaser.Scene, options?: BackgroundViewOptions) {
    this.options = { ...defaultOptions, ...options };
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);

    const sky = this.scene.add.image(0, 0, skyTexture.key).setOrigin(0, 0);
    const mountain_3 = this.scene.add.image(0, 0, mountainTexture_3.key).setOrigin(0, 0);
    const mountain_2 = this.scene.add.image(0, 300, mountainTexture_2.key).setOrigin(0, 0);
    const mountain_1 = this.scene.add.image(0, 200, mountainTexture_1.key).setOrigin(0, 0);
    const ground = this.scene.add.image(0, -28, groundTexture.key).setOrigin(0, 0);

    this.container.add(sky);
    this.container.add(mountain_3);
    this.container.add(mountain_2);
    this.container.add(mountain_1);
    this.container.add(ground);

    this.clouds = new Clouds(scene, this.options.clouds, this.container);
  }


  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  update(time: number, delta: number): void {
    this.clouds.update(time, delta);
  }
}
