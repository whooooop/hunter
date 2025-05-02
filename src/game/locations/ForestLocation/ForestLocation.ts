import * as Phaser from 'phaser';
import { Location } from '../../core/types/Location';
import { FOREST_COLORS, INTERACTIVE_OBJECTS, CLOUDS } from './ForestLocationConfig';
import { createLogger } from '../../../utils/logger';
import { GameplayScene } from '../../scenes/GameplayScene/GameplayScene';
import { ForestShop } from './components/ForestShop';
import { SpruceTree } from './components/SpruceTree';
import { generateStringWithLength } from '../../../utils/stringGenerator';

import skyImage from './assets/images/sky.png';
import groundImage from './assets/images/ground.png';
import rockImage from './assets/images/rock.png';
import rockImage2 from './assets/images/rock2.png';
import { Clouds } from '../../ui/Clouds';

const logger = createLogger('ForestLocation');

const GROUND_TEXTURE = 'ground_texture_' + generateStringWithLength(6);
const ROCK_TEXTURE = 'rock_texture_' + generateStringWithLength(6);
const ROCK_TEXTURE_2 = 'rock_texture_2_' + generateStringWithLength(6);
const SKY_TEXTURE = 'sky_texture_' + generateStringWithLength(6);

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
    this.scene.load.image(SKY_TEXTURE, skyImage);
    this.scene.load.image(GROUND_TEXTURE, groundImage);
    this.scene.load.image(ROCK_TEXTURE, rockImage);
    this.scene.load.image(ROCK_TEXTURE_2, rockImage2);

    Clouds.preload(this.scene);
    ForestShop.preload(this.scene);
    SpruceTree.preload(this.scene);
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
  }

  private setupLocationBounds(): void {
    this.bounds.left = 0;
    this.bounds.right = this.width;
    this.bounds.top = this.skyHeight - 40; // Отступ от неба
    this.bounds.bottom = this.height;
  }

  private createBackground(): void {
    // Создаем небо (на всю ширину экрана)
    const sky = this.scene.add.image(this.width / 2, this.skyHeight, SKY_TEXTURE);
    
    sky.setOrigin(0.5);
    sky.setDepth(0);

    // Создаем землю под небом
    const ground = this.scene.add.image(this.width / 2, this.skyHeight / 2, GROUND_TEXTURE);
    ground.setDisplaySize(this.width, this.skyHeight);
    ground.setOrigin(0.5);
    ground.setDepth(5); // Выше неба, но ниже игровых объектов
    
    // Создаем статичный цветной фон под шейдером для участков, где нет травы
    const background = this.scene.add.graphics();
    background.fillStyle(FOREST_COLORS.grassColor, 1);
    background.fillRect(0, this.skyHeight, this.width, this.height - this.skyHeight);
    background.setDepth(1);


    // Создаем текстуру для гор
    const rockTexture = this.scene.add.image(this.width / 2, this.skyHeight / 2, ROCK_TEXTURE);
    rockTexture.setDepth(3);
    rockTexture.setOrigin(0.5, 0.5);
    rockTexture.setDisplaySize(this.width, this.skyHeight);

    const rockTexture2 = this.scene.add.image(this.width / 2, this.skyHeight / 2, ROCK_TEXTURE_2);
    rockTexture2.setDepth(2);
    rockTexture2.setOrigin(0.5, 0.5);
    rockTexture2.setDisplaySize(this.width, this.skyHeight);
    
  }
  
  public update(time: number, delta: number = 16): void {
    this.clouds.update(time, delta);
  }
  
  public destroy(): void {}

  private createTrees(): void {
    INTERACTIVE_OBJECTS.forEach(({ id, type, position, scale, health }) => {    
      const object = new SpruceTree(this.scene, id, position[0], position[1], {
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