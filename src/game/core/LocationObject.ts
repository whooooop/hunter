import { createLogger } from '../../utils/logger';
import { settings } from '../settings';

const logger = createLogger('LocationObject');

interface LocationObjectOptions {
    texture: string;
    frame: number;
    health: number;
    depthOffset: number;
    scale: number;
}

export class LocationObject extends Phaser.GameObjects.Sprite {
    protected health: number;
    protected options: LocationObjectOptions;
    protected frameIndex: number = 0;
    public isDestroyed: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, options: LocationObjectOptions) {
        super(scene, x, y, options.texture, 0);
        this.health = options.health;
        this.options = options;
        this.setDepth(y + settings.gameplay.depthOffset + options.depthOffset);
        this.setOrigin(0.5, 0.5);
        this.setScale(options.scale);
    }

    /**
     * Применяет урон к дереву
     * @param damage Величина урона
     */
    public takeDamage(damage: number): void {
        console.log('takeDamage', damage);
        
        if (this.isDestroyed) {
            return;
        }
        
        // Применяем урон
        this.health = Math.max(0, this.health - damage);
        
        // Обновляем визуальное состояние объекта
        this.updateVisualState();
        
        // Если здоровье опустилось до нуля, объект разрушается
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroyObject();
        }
    }
    
    protected healthPercent(): number {
        return this.health / this.options.health;
    }

    protected calculateFrameIndex(healthPercent: number): number {
        // При 100% здоровья (healthPercent = 1) должен быть кадр 0 (первый)
        // При 0% здоровья (healthPercent = 0) должен быть кадр 4 (последний)
        
        if (healthPercent >= 0.8) {
            return 0; // 80-100% здоровья - первый кадр (неповрежденное)
        } else if (healthPercent >= 0.6) {
            return 1; // 60-80% здоровья - второй кадр (слегка поврежденное)
        } else if (healthPercent >= 0.4) {
            return 2; // 40-60% здоровья - третий кадр (умеренно поврежденное)
        } else if (healthPercent > 0) {
            return 3; // 20-40% здоровья - четвертый кадр (сильно поврежденное)
        } else {
            return 4; // 0-20% здоровья - пятый кадр (разрушенное)
        }
    }

    /**
     * Обновляет визуальное состояние дерева в зависимости от текущего здоровья
     */
    private updateVisualState(): void {
        const healthPercent = this.healthPercent();
        this.frameIndex = this.calculateFrameIndex(healthPercent);
        this.setFrame(this.frameIndex);
    }
    
    /**
     * Полностью разрушает объект
     */
    public destroyObject(): void {
        // Объект разрушен
        this.isDestroyed = true;
        
        // Отключаем автоматический вызов preUpdate для этого объекта
        this.setActive(false);
        
        // Оставляем объект видимым
        this.setVisible(true);
    }
}