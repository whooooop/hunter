import * as Phaser from 'phaser';
import { LocationType } from '../core/Constants';

export interface LocationConfig {
  background: string;
  obstacles?: {
    texture: string;
    positions: Array<{ x: number, y: number }>;
  }[];
  music?: string;
  ambientSounds?: string[];
}

export class ForestLocation {
  private scene: Phaser.Scene;
  private config: LocationConfig;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Стандартная конфигурация для локации "Лес"
    this.config = {
      background: 'forest_background',
      obstacles: [
        {
          texture: 'tree',
          positions: [
            { x: 200, y: 150 },
            { x: 400, y: 350 },
            { x: 600, y: 250 }
          ]
        },
        {
          texture: 'rock',
          positions: [
            { x: 300, y: 450 },
            { x: 500, y: 150 }
          ]
        }
      ],
      music: 'forest_music',
      ambientSounds: ['bird_chirp', 'wind']
    };
  }
  
  public getType(): LocationType {
    return LocationType.FOREST;
  }
  
  public getConfig(): LocationConfig {
    return this.config;
  }
  
  // Метод для создания локации на сцене
  public create(): void {
    // Создаем фон
    this.scene.add.image(0, 0, this.config.background)
      .setOrigin(0, 0)
      .setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    
    // Создаем препятствия, если они есть
    if (this.config.obstacles) {
      this.config.obstacles.forEach(obstacleGroup => {
        obstacleGroup.positions.forEach(pos => {
          this.scene.add.image(pos.x, pos.y, obstacleGroup.texture);
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
} 