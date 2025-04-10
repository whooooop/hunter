import * as Phaser from 'phaser';
import { BaseLocation } from './BaseLocation';
import { ForestLocation } from '../locations/ForestLocation/ForestLocation';
import { createLogger } from '../../utils/logger';

const logger = createLogger('LocationManager');

/**
 * Класс для управления локациями в игре
 */
export class LocationManager {
  private currentLocation: BaseLocation | null = null;
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    logger.info('Инициализация менеджера локаций');
  }
  
  /**
   * Загрузка локации по её ID
   * @param locationId Идентификатор локации
   * @returns Промис с созданной локацией
   */
  loadLocation(locationId: string): BaseLocation {
    // Очистка предыдущей локации если есть
    if (this.currentLocation) {
      logger.info(`Очистка предыдущей локации перед загрузкой ${locationId}`);
      this.currentLocation.destroy();
      this.currentLocation = null;
    }
    
    logger.info(`Загрузка локации: ${locationId}`);
    
    // Создаем экземпляр нужной локации
    switch (locationId) {
      case 'forest':
        this.currentLocation = new ForestLocation(this.scene);
        break;
      // Здесь добавляем другие локации по мере их создания
      // case 'desert':
      //   this.currentLocation = new DesertLocation(this.scene);
      //   break;
      default:
        logger.warn(`Неизвестная локация: ${locationId}, загружаем локацию по умолчанию (forest)`);
        this.currentLocation = new ForestLocation(this.scene);
    }
    
    return this.currentLocation;
  }
  
  /**
   * Возвращает текущую активную локацию
   */
  getCurrentLocation(): BaseLocation | null {
    return this.currentLocation;
  }
}