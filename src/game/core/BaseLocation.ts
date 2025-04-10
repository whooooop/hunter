import * as Phaser from 'phaser';
import { createLogger } from '../../utils/logger';

const logger = createLogger('BaseLocation');

/**
 * Абстрактный класс для всех локаций в игре
 */
export abstract class BaseLocation {
    protected scene: Phaser.Scene;
    
    constructor(scene: Phaser.Scene) {
      this.scene = scene;
      logger.info('Создание локации');
    }
    
    /**
     * Метод для предзагрузки ресурсов локации
     * Вызывается в методе preload сцены
     */
    abstract preload(): void;
    
    /**
     * Метод для создания локации
     * Вызывается в методе create сцены
     */
    abstract create(): void;
    
    /**
     * Метод для обновления локации
     * Вызывается в методе update сцены
     */
    abstract update(time: number): void;
    
    /**
     * Метод для очистки ресурсов локации
     * Вызывается при уничтожении локации
     */
    destroy(): void {
      logger.info('Уничтожение локации');
    }
}