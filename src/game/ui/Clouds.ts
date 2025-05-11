import cloudUrl from '../assets/images/cloud.png';
import { DISPLAY } from "../config";

const cloudTexture = {
  key: 'cloud',
  url: cloudUrl
}

export interface CloudOptions {
  position: [number, number];
  scale: number;
  alpha: number;
  speed: number;
  depth: number;
  direction: number;
}

export class Clouds {
  private scene: Phaser.Scene;
  private clouds: Phaser.GameObjects.Image[] = [];
  private container: Phaser.GameObjects.Container;

  static preload(scene: Phaser.Scene): void {
    scene.load.image(cloudTexture.key, cloudTexture.url);
  }

  constructor(scene: Phaser.Scene, clouds: CloudOptions[], container: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.container = container;
    this.createClouds(clouds);
  }

  private createClouds(clouds: CloudOptions[]): void {
    this.clouds = [];
    
    // Создаем облака из конфигурации
    clouds.forEach(cloudConfig => {
      const [x, y] = cloudConfig.position;
      
      // Создаем спрайт облака
      const cloud = this.scene.add.image(x, y, cloudTexture.key);
      
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
      this.container.add(cloud);
    });
  }
  
  /**
   * Обновляет положение облаков для создания эффекта движения
   */
  public update(time: number, delta: number): void {
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
      if (cloud.x > DISPLAY.WIDTH + cloud.width) {
        cloud.x = -cloud.width;
      } else if (cloud.x < -cloud.width) {
        cloud.x = DISPLAY.WIDTH + cloud.width;
      }
    });
  }
}
