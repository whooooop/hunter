import * as Phaser from 'phaser';
import { BaseLocation, LocationBounds } from '../../core/BaseLocation';
import { ForestLocationConfig, DEFAULT_FOREST_CONFIG, FOREST_COLORS, INTERACTIVE_OBJECTS } from './ForestLocationConfig';
import { GRASS_SHADER_KEY, GRASS_FRAGMENT_SHADER, GRASS_VERTEX_SHADER } from './GrassShader';
import { createLogger } from '../../../utils/logger';
import skyImage from './assets/images/sky.png';
import groundImage from './assets/images/ground.png';
import { GameplayScene } from '../../scenes/GameplayScene';
import { ForestShop } from './components/ForestShop';
import { SpruceTree } from './components/SpruceTree';

const logger = createLogger('ForestLocation');

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

  // Ссылка на шейдер травы
  private grassShader: Phaser.GameObjects.Shader | null = null;
  
  constructor(scene: Phaser.Scene, config: Partial<ForestLocationConfig> = {}) {
    super(scene);
    
    // Объединяем стандартную конфигурацию с пользовательской
    this.config = {
      ...DEFAULT_FOREST_CONFIG,
      ...config
    };
    
    // Регистрируем шейдер для травы
    this.registerGrassShader();
  }
  
  /**
   * Предзагрузка ресурсов для лесной локации
   */
  public preload(): void {
    this.scene.load.image('forest_location_sky', skyImage);
    this.scene.load.image('forest_location_ground', groundImage);
    
    ForestShop.preload(this.scene);
    SpruceTree.preload(this.scene);
  }
  
  // Регистрируем шейдер травы
  private registerGrassShader(): void {
    // Регистрируем шейдер
    this.scene.cache.shader.add(GRASS_SHADER_KEY, {
      fragment: GRASS_FRAGMENT_SHADER,
      vertex: GRASS_VERTEX_SHADER
    });
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
    this.skyHeight = this.height / 6;
    
    // Устанавливаем границы локации
    this.setupLocationBounds();
    
    this.createBackground();
    // this.createGrassShader();
    
    this.createShop();
    
    // Создаем деревья
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
    this.bounds.top = this.skyHeight + 50; // Отступ от неба
    
    // Нижняя граница - низ экрана
    this.bounds.bottom = this.height;
  }

  private createBackground(): void {
    // Создаем небо (на всю ширину экрана)
    const sky = this.scene.add.image(this.width / 2, this.skyHeight / 2, 'forest_location_sky');
    
    // Используем setScale вместо setDisplaySize для более точного контроля
    
    sky.setOrigin(0.5, 0.5);
    sky.setDepth(0);

    // Создаем землю под небом
    // const ground = this.scene.add.image(this.width / 2, this.skyHeight, 'forest_location_ground');
    // ground.setDisplaySize(this.width, this.skyHeight);
    // ground.setOrigin(0.5, 0.5);
    // ground.setDepth(2); // Выше неба, но ниже игровых объектов
    
    // Создаем статичный цветной фон под шейдером для участков, где нет травы
    const background = this.scene.add.graphics();
    background.fillStyle(FOREST_COLORS.grassColor, 1);
    background.fillRect(0, this.skyHeight + 40, this.width, this.height - this.skyHeight - 40);
    background.setDepth(1);
  }
  
  // Метод для обновления анимации травы
  public update(time: number): void {
    if (this.grassShader) {
      // Обновляем время для анимации в шейдере
      this.grassShader.setUniform('time', time / 1000);
    }
  }
  
  // Переопределяем метод destroy для очистки ресурсов
  public override destroy(): void {
    logger.info('Уничтожение лесной локации');
    
    // Уничтожаем шейдер травы
    if (this.grassShader) {
      this.grassShader.destroy();
      this.grassShader = null;
    }
    
    // Вызываем метод базового класса
    super.destroy();
  }

  /**
   * Создает ёлку и размещает ее справа на сцене
   */
  private createTrees(): void {
    // this.createTrees(this.width / 2, this.skyHeight + 300);
    // this.createTree(this.width / 2 - 30, this.skyHeight + 230);

    INTERACTIVE_OBJECTS.forEach(({ type, position, scale, health }) => {    
      const object = new SpruceTree(this.scene, position[0], position[1], {
        scale,
        health
      });

      // Добавляем её на сцену
      this.scene.add.existing(object);
    
      // Добавляем дерево в группу интерактивных объектов
      if (this.scene instanceof GameplayScene) {
        const gameScene = this.scene as GameplayScene;
        // Т.к. Tree наследуется от LocationObject, а LocationObject от Sprite,
        // мы можем безопасно привести его к типу Phaser.Physics.Arcade.Sprite
        // Это решит проблему несоответствия типов между Tree и ожидаемым Sprite
        gameScene.addInteractiveObject(object as unknown as Phaser.Physics.Arcade.Sprite);
      }
    });
  }

  /**
   * Создает магазин на локации
   */
  private createShop(): void {
    // Размещаем магазин в левом углу ниже слоя неба
    const shopX = 120;
    const shopY = this.skyHeight + 40;
    
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