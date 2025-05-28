import * as Phaser from 'phaser';
import { GameplayScene } from '../../scenes/GameplayScene';
import { Location } from '../../types/Location';
import { createLogger } from '../../utils/logger';
import { ForestShop } from './components/ForestShop';
import { SpruceTree } from './components/SpruceTree';
import { CLOUDS, FOREST_COLORS, INTERACTIVE_OBJECTS } from './ForestLocationConfig';

import { DEBUG } from '../../config';
import { preloadImage } from '../../preload';
import { Clouds } from '../../ui/Clouds';
import { hexToNumber } from '../../utils/colors';
import { TREE_COLLECTIONS } from './components';
import { BirchTree } from './components/BirchTree';
import { GroundTexture, RockTexture, RockTexture2, SkyTexture } from './textures';

const logger = createLogger('ForestLocation');

export class ForestLocation implements Location.BaseClass {
  private scene: Phaser.Scene;

  private width: number = 0;
  private height: number = 0;
  private skyHeight: number = 0;
  public bounds: Location.Bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };

  private clouds!: Clouds;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public preload(): void {
    preloadImage(this.scene, SkyTexture);
    preloadImage(this.scene, GroundTexture);
    preloadImage(this.scene, RockTexture);
    preloadImage(this.scene, RockTexture2);

    Clouds.preload(this.scene);
    ForestShop.preload(this.scene);
    SpruceTree.preload(this.scene);
    BirchTree.preload(this.scene);
  }

  public getBounds(): Location.Bounds {
    return this.bounds;
  }

  public create(): void {
    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;
    this.skyHeight = 188;

    this.setupLocationBounds();

    this.createBackground();

    this.clouds = new Clouds(this.scene, CLOUDS, this.scene.add.container(0, 0));

    this.createShop();

    this.createTrees();

    if (DEBUG.LOCATION) {
      const graphics = this.scene.add.graphics();
      graphics.setDepth(1000);
      graphics.lineStyle(2, hexToNumber('#fbb52f'), 1);
      graphics.strokeRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, this.bounds.bottom - this.bounds.top);
    }
  }

  private setupLocationBounds(): void {
    this.bounds.left = 0;
    this.bounds.right = this.width;
    this.bounds.top = this.skyHeight; // Отступ от неба
    this.bounds.bottom = this.height;
  }

  private createBackground(): void {
    // Создаем небо (на всю ширину экрана)
    const sky = this.scene.add.image(this.width / 2, this.skyHeight, SkyTexture.key);

    sky.setOrigin(0.5);
    sky.setDepth(0);

    // Создаем землю под небом
    const ground = this.scene.add.image(this.width / 2, this.skyHeight / 2, GroundTexture.key);
    ground.setDisplaySize(this.width, this.skyHeight);
    ground.setOrigin(0.5);
    ground.setDepth(5); // Выше неба, но ниже игровых объектов

    // Создаем статичный цветной фон под шейдером для участков, где нет травы
    const background = this.scene.add.graphics();
    background.fillStyle(FOREST_COLORS.grassColor, 1);
    background.fillRect(0, this.skyHeight, this.width, this.height - this.skyHeight);
    background.setDepth(1);


    // Создаем текстуру для гор
    const rockTexture = this.scene.add.image(this.width / 2, this.skyHeight / 2, RockTexture.key);
    rockTexture.setDepth(3);
    rockTexture.setOrigin(0.5, 0.5);
    rockTexture.setDisplaySize(this.width, this.skyHeight);

    const rockTexture2 = this.scene.add.image(this.width / 2, this.skyHeight / 2, RockTexture2.key);
    rockTexture2.setDepth(2);
    rockTexture2.setOrigin(0.5, 0.5);
    rockTexture2.setDisplaySize(this.width, this.skyHeight);

  }

  public update(time: number, delta: number = 16): void {
    this.clouds.update(time, delta);
  }

  public destroy(): void { }

  private createTrees(): void {
    INTERACTIVE_OBJECTS.forEach(({ id, type, position, scale, health }) => {
      const TreeClass = TREE_COLLECTIONS[type];

      const object = new TreeClass(this.scene, id, position[0], position[1], {
        scale,
        health
      });

      if (this.scene instanceof GameplayScene) {
        const gameScene = this.scene as GameplayScene;
        gameScene.addDamageableObject(id, object);
      }
    });
  }

  private createShop(): void {
    const shopX = 50;
    const shopY = this.skyHeight - 20;

    const shop = new ForestShop(this.scene, shopX, shopY);
    if (this.scene instanceof GameplayScene) {
      const gameScene = this.scene as GameplayScene;
      gameScene.addShop(shop);
      this.scene.add.existing(shop);
    }
  }
}