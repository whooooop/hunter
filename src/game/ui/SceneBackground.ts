import { settings } from "../settings";
import { CloudOptions, Clouds } from "./Clouds";

import mainMenuGround from '../assets/images/ground.png';
import mainMenuSky from '../assets/images/sky.png';
import mainMenuMountains_1 from '../assets/images/mountains_1.png';
import mainMenuMountains_2 from '../assets/images/mountains_2.png';
import mainMenuMountains_3 from '../assets/images/mountains_3.png';

const defaultOptions: SceneBackgroundOptions = {
  clouds: [
    { position: [120, 90], scale: 0.5, alpha: 1, speed: 0.2, depth: 9, direction: 1 },
    { position: [300, 80], scale: 0.7, alpha: 1, speed: 0.15, depth: 16, direction: -1 },
    { position: [550, 40], scale: 0.4, alpha: 1, speed: 0.3, depth: 21, direction: 1 },
    { position: [800, 50], scale: 0.8, alpha: 1, speed: 0.1, depth: 26, direction: -1 },
    { position: [1000, 90], scale: 0.6, alpha: 1, speed: 0.25, depth: 11, direction: 1 },
    { position: [1250, 70], scale: 0.5, alpha: 0.6, speed: 0.2, depth: 25, direction: -1 }
  ],
}

interface SceneBackgroundOptions {
  clouds: CloudOptions[];
}

export class SceneBackground {
  private scene: Phaser.Scene;
  private clouds!: Clouds;
  private options: SceneBackgroundOptions;

  static preload(scene: Phaser.Scene) {
    scene.load.image(skyTexture.key, skyTexture.url);
    scene.load.image(groundTexture.key, groundTexture.url);
    scene.load.image(mountainTexture_1.key, mountainTexture_1.url);
    scene.load.image(mountainTexture_2.key, mountainTexture_2.url);
    scene.load.image(mountainTexture_3.key, mountainTexture_3.url);   
    Clouds.preload(scene);
  }

  constructor(scene: Phaser.Scene, options?: SceneBackgroundOptions) {
    this.scene = scene;
    this.options = { ...defaultOptions, ...options };

    this.scene.add.image(0, 0, skyTexture.key, settings.display.width).setOrigin(0, 0).setScale(1.2).setDepth(5);
    this.scene.add.image(0, 0, mountainTexture_3.key, settings.display.width).setOrigin(0, 0).setDepth(10);
    this.scene.add.image(0, 300, mountainTexture_2.key, settings.display.width).setOrigin(0, 0).setDepth(15);
    this.scene.add.image(0, 200, mountainTexture_1.key, settings.display.width).setOrigin(0, 0).setDepth(20);
    this.scene.add.image(0, -28, groundTexture.key, settings.display.width).setOrigin(0, 0).setDepth(25);  

    this.clouds = new Clouds(scene, this.options.clouds);
  }

  update(time: number, delta: number): void {
    this.clouds.update(time, delta);
  }
}

const groundTexture = {
  key: 'main_menu_ground',
  url: mainMenuGround,
}

const skyTexture = {
  key: 'main_menu_sky',
  url: mainMenuSky,
}

const mountainTexture_1 = {
  key: 'main_menu_mountain_1',
  url: mainMenuMountains_1,
}

const mountainTexture_2 = {
  key: 'main_menu_mountain_2',
  url: mainMenuMountains_2,
}

const mountainTexture_3 = {
  key: 'main_menu_mountain_3',
  url: mainMenuMountains_3,
}