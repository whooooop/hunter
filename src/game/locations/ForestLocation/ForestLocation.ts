import * as Phaser from 'phaser';
import { BaseLocation, LocationBounds } from '../../core/BaseLocation';
import { ForestLocationConfig, DEFAULT_FOREST_CONFIG, FOREST_COLORS, INTERACTIVE_OBJECTS, CLOUDS } from './ForestLocationConfig';
import { createLogger } from '../../../utils/logger';
import { GameplayScene } from '../../scenes/GameplayScene/GameplayScene';
import { ForestShop } from './components/ForestShop';
import { SpruceTree } from './components/SpruceTree';
import { generateStringWithLength } from '../../../utils/stringGenerator';

import skyImage from './assets/images/sky.png';
import groundImage from './assets/images/ground.png';
import rockImage from './assets/images/rock.png';
import rockImage2 from './assets/images/rock2.png';
import cloudImage from './assets/images/cloud.png';
import { BaseShop } from '../../core/BaseShop';

const logger = createLogger('ForestLocation');

const GROUND_TEXTURE = 'ground_texture_' + generateStringWithLength(6);
const ROCK_TEXTURE = 'rock_texture_' + generateStringWithLength(6);
const ROCK_TEXTURE_2 = 'rock_texture_2_' + generateStringWithLength(6);
const SKY_TEXTURE = 'sky_texture_' + generateStringWithLength(6);
const CLOUD_TEXTURE = 'cloud_texture_' + generateStringWithLength(6);

export class ForestLocation extends BaseLocation {
  private config: ForestLocationConfig;

  private width: number = 0;
  private height: number = 0;
  private skyHeight: number = 0;
  public bounds: LocationBounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };

  // Массив для хранения облаков
  private clouds: Phaser.GameObjects.Image[] = [];
  
  constructor(scene: Phaser.Scene, config: Partial<ForestLocationConfig> = {}) {
    super(scene);
    
    // Объединяем стандартную конфигурацию с пользовательской
    this.config = {
      ...DEFAULT_FOREST_CONFIG,
      ...config
    };
  }
  
  /**
   * Предзагрузка ресурсов для лесной локации
   */
  public preload(): void {
    this.scene.load.image(SKY_TEXTURE, skyImage);
    this.scene.load.image(GROUND_TEXTURE, groundImage);
    this.scene.load.image(ROCK_TEXTURE, rockImage);
    this.scene.load.image(ROCK_TEXTURE_2, rockImage2);  
    this.scene.load.image(CLOUD_TEXTURE, cloudImage);
    ForestShop.preload(this.scene);
    SpruceTree.preload(this.scene);
    BaseShop.preload(this.scene);
  }
  
  public getConfig(): ForestLocationConfig {
    return this.config;
  }
  
  /**
   * Возвращает границы локации для ограничения движения игрока
   */
  public getBounds(): { left: number, right: number, top: number, bottom: number } {
    return this.bounds;
  }
  
  // Реализация метода базового класса
  public create(): void {
    // Получаем размеры экрана
    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;
    this.skyHeight = 188;
    
    // Устанавливаем границы локации
    this.setupLocationBounds();
    
    this.createBackground();

    this.createClouds();

    this.createShop();
    
    this.createTrees();
  }

  /**
   * Устанавливает границы локации для ограничения движения игрока
   */
  private setupLocationBounds(): void {
    // Левая граница - край экрана
    this.bounds.left = 0;
    
    // Правая граница - край экрана
    this.bounds.right = this.width;
    
    // Верхняя граница - верхний край земли (небо недоступно)
    this.bounds.top = this.skyHeight + 10; // Отступ от неба
    
    // Нижняя граница - низ экрана
    this.bounds.bottom = this.height;
  }

  private createBackground(): void {
    // Создаем небо (на всю ширину экрана)
    const sky = this.scene.add.image(this.width / 2, this.skyHeight, SKY_TEXTURE);
    
    // Используем setScale вместо setDisplaySize для более точного контроля
    
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
  
  private createClouds(): void {
    // Удаляем существующие облака, если они есть
    this.clouds.forEach(cloud => cloud.destroy());
    this.clouds = [];
    
    // Создаем облака из конфигурации
    CLOUDS.forEach(cloudConfig => {
      const [x, y] = cloudConfig.position;
      
      // Создаем спрайт облака
      const cloud = this.scene.add.image(x, y, CLOUD_TEXTURE);
      
      // Настраиваем размер (масштаб)
      cloud.setScale(cloudConfig.scale);
      
      // Настраиваем прозрачность
      cloud.setAlpha(cloudConfig.alpha);
      
      // Сохраняем параметры движения в данных спрайта
      cloud.setData('speed', cloudConfig.speed);
      cloud.setData('direction', cloudConfig.direction);
      
      // Устанавливаем низкий приоритет отображения
      cloud.setDepth(cloudConfig.depth);
      
      // Добавляем в массив для обновления
      this.clouds.push(cloud);
    });
  }
  
  /**
   * Обновляет положение облаков для создания эффекта движения
   */
  private updateClouds(delta: number): void {
    // Нормализуем дельту времени (для стабильного движения)
    const normalizedDelta = delta / 16;
    
    // Обновляем положение каждого облака
    this.clouds.forEach(cloud => {
      // Получаем скорость и направление из данных облака
      const speed = cloud.getData('speed');
      const direction = cloud.getData('direction');
      
      // Обновляем позицию
      cloud.x += speed * direction * normalizedDelta;
      
      // Если облако вышло за границы экрана, перемещаем его на противоположную сторону
      if (cloud.x > this.width + cloud.width) {
        cloud.x = -cloud.width;
      } else if (cloud.x < -cloud.width) {
        cloud.x = this.width + cloud.width;
      }
    });
  }
  
  // Метод для обновления анимации травы
  public update(time: number, delta: number = 16): void {
    // Обновляем облака
    this.updateClouds(delta);
  }
  
  // Переопределяем метод destroy для очистки ресурсов
  public override destroy(): void {
    logger.info('Уничтожение лесной локации');
    
    // Вызываем метод базового класса
    super.destroy();
  }

  /**
   * Создает ёлку и размещает ее справа на сцене
   */
  private createTrees(): void {
    INTERACTIVE_OBJECTS.forEach(({ id, type, position, scale, health }) => {    
      const object = new SpruceTree(this.scene, id, position[0], position[1], {
        scale,
        health
      });
      
      // Добавляем дерево в группу интерактивных объектов
      if (this.scene instanceof GameplayScene) {
        const gameScene = this.scene as GameplayScene;
        gameScene.addDamageableObject(object);
      }
    });
  }

  /**
   * Создает магазин на локации
   */
  private createShop(): void {
    // Размещаем магазин в левом углу ниже слоя неба
    const shopX = 50;
    const shopY = this.skyHeight - 20;
    
    // Создаем магазин и добавляем его на сцену
    const shop = new ForestShop(this.scene, shopX, shopY);
    // this.scene.add.existing(shop);
    if (this.scene instanceof GameplayScene) {
      const gameScene = this.scene as GameplayScene;
      gameScene.addShop(shop);
      this.scene.add.existing(shop);
    }
    logger.info('Создан магазин в лесной локации');
  }
} 