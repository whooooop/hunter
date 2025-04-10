import * as Phaser from 'phaser';
import { BaseLocation } from '../../core/BaseLocation';
import { ForestLocationConfig, DEFAULT_FOREST_CONFIG, FOREST_COLORS } from './ForestLocationConfig';
import { GRASS_SHADER_KEY, GRASS_FRAGMENT_SHADER, GRASS_VERTEX_SHADER } from './GrassShader';
import { createLogger } from '../../../utils/logger';
import skyImage from './assets/images/sky.png';
import groundImage from './assets/images/ground.png';
import { Tree } from './components/Tree';
import { GameplayScene } from '../../scenes/GameplayScene';

const logger = createLogger('ForestLocation');

export class ForestLocation extends BaseLocation {
  private config: ForestLocationConfig;

  private width: number = 0;
  private height: number = 0;
  private skyHeight: number = 0;

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
    logger.info('preload', groundImage);
    this.scene.load.image('forest_location_sky', skyImage);
    this.scene.load.image('forest_location_ground', groundImage);
    
    // Предзагрузка ресурсов для дерева
    Tree.preload(this.scene);
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
  
  // Реализация метода базового класса
  public create(): void {
    // Получаем размеры экрана
    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;
    this.skyHeight = this.height / 6;
    
    this.createBackground();
    // this.createGrassShader();
    
    // Создаем ёлку справа по центру
    this.createTree(this.width / 2, this.skyHeight + 300);
    this.createTree(this.width / 2 - 30, this.skyHeight + 230);
  }

  private createBackground(): void {
    // Создаем небо (на всю ширину экрана)
    const sky = this.scene.add.image(this.width / 2, this.skyHeight / 2, 'forest_location_sky');
    
    // Используем setScale вместо setDisplaySize для более точного контроля
    // const scaleX = this.width / frame.width;
    // const scaleY = this.skyHeight / frame.height;
    // sky.setScale(scaleX, scaleY);
    
    sky.setOrigin(0.5, 0.5);
    sky.setDepth(0);

    // Создаем землю под небом
    const ground = this.scene.add.image(this.width / 2, this.skyHeight, 'forest_location_ground');
    // ground.setDisplaySize(this.width, this.skyHeight);
    ground.setOrigin(0.5, 0.5);
    ground.setDepth(2); // Выше неба, но ниже игровых объектов
    
    // Создаем статичный цветной фон под шейдером для участков, где нет травы
    const background = this.scene.add.graphics();
    background.fillStyle(FOREST_COLORS.grassColor, 1);
    background.fillRect(0, this.skyHeight + 40, this.width, this.height - this.skyHeight - 40);
    background.setDepth(1);
  }

  private createGrassShader(): void {
    try {
      // Конвертируем цвет травы из hex в RGB для шейдера (от 0 до 1)
      const r = ((FOREST_COLORS.grassColor >> 16) & 0xFF) / 255;
      const g = ((FOREST_COLORS.grassColor >> 8) & 0xFF) / 255;
      const b = (FOREST_COLORS.grassColor & 0xFF) / 255;
    
      // Создаем BaseShader и используем его для создания шейдера
      const baseShader = new Phaser.Display.BaseShader(GRASS_SHADER_KEY, GRASS_FRAGMENT_SHADER, GRASS_VERTEX_SHADER);
      
      // Создаем шейдер, используя BaseShader
      this.grassShader = this.scene.add.shader(
        baseShader,
        this.width / 2,     // позиция x (центр экрана)
        this.height / 2,    // позиция y (центр экрана)
        this.width * 2,     // ширина (в два раза больше экрана)
        this.height * 2     // высота (в два раза больше экрана)
      );
      
      // Устанавливаем uniform-параметры шейдера
      this.grassShader.setUniform('grassColor.value', [r, g, b]);
      this.grassShader.setUniform('resolution.value', [this.width * 2, this.height * 2]);
      
      // Устанавливаем правильную глубину отрисовки
      this.grassShader.setDepth(5);
      
      // Устанавливаем origin в (0.5, 0.5) для правильного позиционирования
      this.grassShader.setOrigin(0.5, 0.5);
      
      // Перемещаем шейдер в нужную позицию
      this.grassShader.setPosition(this.width / 2, this.skyHeight + (this.height - this.skyHeight) / 2);
    } catch (error: any) {
      logger.error('Ошибка при создании шейдера:', error);
    }
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
  private createTree(x: number, y: number): void {
    // Создаем ёлку
    const tree = new Tree(this.scene, x, y);

    // Добавляем её на сцену
    this.scene.add.existing(tree);
    
    // Добавляем дерево в группу интерактивных объектов
    if (this.scene instanceof GameplayScene) {
      const gameScene = this.scene as GameplayScene;
      // Т.к. Tree наследуется от LocationObject, а LocationObject от Sprite,
      // мы можем безопасно привести его к типу Phaser.Physics.Arcade.Sprite
      // Это решит проблему несоответствия типов между Tree и ожидаемым Sprite
      gameScene.addInteractiveObject(tree as unknown as Phaser.Physics.Arcade.Sprite);
      logger.info(`Дерево добавлено в группу интерактивных объектов`);
    }
  }
} 