import * as Phaser from 'phaser';
import { ForestLocationConfig, DEFAULT_FOREST_CONFIG, FOREST_COLORS } from './ForestLocationConfig';
import { GRASS_SHADER_KEY, GRASS_FRAGMENT_SHADER, GRASS_VERTEX_SHADER } from './GrassShader';

export class ForestLocation {
  private scene: Phaser.Scene;
  private config: ForestLocationConfig;
  
  // Ссылка на шейдер травы
  private grassShader: Phaser.GameObjects.Shader | null = null;
  
  constructor(scene: Phaser.Scene, config: Partial<ForestLocationConfig> = {}) {
    this.scene = scene;
    
    // Объединяем стандартную конфигурацию с пользовательской
    this.config = {
      ...DEFAULT_FOREST_CONFIG,
      ...config
    };
    
    // Регистрируем шейдер для травы
    this.registerGrassShader();
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
  
  // Метод для создания локации на сцене
  public create(): void {
    // Получаем размеры экрана
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    const skyHeight = height / 6;
    
    // Создаем графический объект для рисования фона
    const background = this.scene.add.graphics();
    
    // Рисуем небо (верхняя 1/6 часть)
    background.fillStyle(FOREST_COLORS.skyColor, 1);
    background.fillRect(0, 0, width, skyHeight);
    background.setDepth(0);
    
    // Создаем статичный цветной фон под шейдером для участков, где нет травы
    background.fillStyle(FOREST_COLORS.grassColor, 1);
    background.fillRect(0, skyHeight, width, height - skyHeight);
    background.setDepth(1);
    
    // Конвертируем цвет травы из hex в RGB для шейдера (от 0 до 1)
    const r = ((FOREST_COLORS.grassColor >> 16) & 0xFF) / 255;
    const g = ((FOREST_COLORS.grassColor >> 8) & 0xFF) / 255;
    const b = (FOREST_COLORS.grassColor & 0xFF) / 255;
    
    try {
      // Создаем BaseShader и использовать его для создания шейдера
      const baseShader = new Phaser.Display.BaseShader(GRASS_SHADER_KEY, GRASS_FRAGMENT_SHADER, GRASS_VERTEX_SHADER);
      
      // Создаем шейдер используя BaseShader
      this.grassShader = this.scene.add.shader(
        baseShader,
        width / 2,                        // позиция x
        height / 2,                       // позиция y
        width,                            // ширина
        height - skyHeight                // высота
      );
      
      // Устанавливаем uniform-параметры шейдера
      this.grassShader.setUniform('grassColor.value', [r, g, b]);
      this.grassShader.setUniform('resolution.value', [width, height - skyHeight]);
      
      // Важно! Устанавливаем правильную глубину отрисовки и позицию для шейдера
      this.grassShader.setDepth(5);
      this.grassShader.y = (skyHeight + height) / 2; // Центрируем относительно области травы
    } catch (error: any) {
      console.error(error);
    }
    
    // Создаем препятствия, если они есть
    if (this.config.obstacles) {
      this.config.obstacles.forEach(obstacleGroup => {
        obstacleGroup.positions.forEach(pos => {
          const obstacle = this.scene.add.image(pos.x, pos.y, obstacleGroup.texture);
          obstacle.setDepth(10); // Объекты должны быть над травой
        });
      });
    }
    
    // Воспроизводим музыку, если она указана
    if (this.config.music) {
      this.scene.sound.play(this.config.music, {
        loop: true,
        volume: 0.5
      });
    }
    
    // Воспроизводим фоновые звуки, если они указаны
    if (this.config.ambientSounds) {
      this.config.ambientSounds.forEach(sound => {
        // Воспроизводим звуки с интервалом
        this.scene.time.addEvent({
          delay: Phaser.Math.Between(5000, 15000),
          callback: () => {
            this.scene.sound.play(sound, {
              volume: 0.3
            });
          },
          loop: true
        });
      });
    }
  }
  
  // Метод для обновления анимации травы
  public update(time: number): void {
    if (this.grassShader) {
      // Обновляем время для анимации в шейдере
      this.grassShader.setUniform('time.value', time / 1000);
    }
  }
} 