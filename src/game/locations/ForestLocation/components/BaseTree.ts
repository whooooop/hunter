import { createLogger } from '../../../../utils/logger';
import { LocationObject } from '../../../core/LocationObject';
import { generateStringWithLength } from '../../../../utils/stringGenerator';

import leafImage from '../assets/images/leaf.png';
import woodChipImage from '../assets/images/wood_chip.png';

const logger = createLogger('Tree');

const TEXTURE_WOOOD_CHIP = 'tree_wood_chop' + generateStringWithLength(6);
const TEXTURE_WOOOD_LEAF = 'tree_leaf' + generateStringWithLength(6);

interface ParticleEffectOptions {
    texture: string;
    count: number;
    hitX: number;
    hitY: number;
    gravity: number;
    angle: number[];
    speed: number[];
    duration: number;
}

interface TreeOptions {
    depthOffset: number;
    scale: number;
    health: number;
    texture: string;
}

export class BaseTree extends LocationObject {
    constructor(scene: Phaser.Scene, x: number, y: number, options: TreeOptions) {
        super(scene, x, y, {
            texture: options.texture,
            frame: 0,
            health: options.health,
            depthOffset: options.depthOffset,
            scale: options.scale
        });
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.image(TEXTURE_WOOOD_CHIP, woodChipImage);
        scene.load.image(TEXTURE_WOOOD_LEAF, leafImage);
    }

    /**
     * Обработка получения урона
     */
    public takeDamage(damage: number): void {
        super.takeDamage(damage);
        this.createHitParticles();
    }
    
    /**
     * Создает частицы, имитирующие разлетающиеся щепки и листья при попадании
     * Используем прямой подход со спрайтами вместо системы частиц
     */
    private createHitParticles(): void {
        logger.debug('Создание эффекта частиц для дерева');
        const healthPercent = this.healthPercent();

        // Небольшое количество частиц
        const woodChipCount = healthPercent > 0.4 ? 0 : healthPercent > 0.1 ? 4 : 1;
        const leafCount = healthPercent > 0.4 ? 4 : 0;
        const particles = [];
        
        // Определяем точку удара - немного смещение от центра для реалистичности
        const hitX = this.x + Phaser.Math.Between(-10, 10);
        const hitY = this.y + Phaser.Math.Between(-10, 10);
        
        this.createParticles({
            texture: TEXTURE_WOOOD_CHIP,
            count: woodChipCount,
            hitX,
            hitY,
            gravity: 300,
            angle: [10, 350],
            speed: [50, 150],
            duration: 600
        });

        this.createParticles({
            texture: TEXTURE_WOOOD_LEAF,
            count: leafCount,
            hitX,
            hitY,
            gravity: 120,
            angle: [-30, 210],
            speed: [30, 80],
            duration: 1000
        });
    }

    private createParticles(options: ParticleEffectOptions): void {
        for (let i = 0; i < options.count; i++) {
            const particle = this.scene.physics.add.sprite(options.hitX, options.hitY, options.texture);
            
            // Настраиваем размер и глубину для лучшей видимости
            // particle.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
            particle.setDepth(100);
            
            // Случайный поворот для разнообразия
            particle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            
            // Разлетаются преимущественно вниз и в стороны
            const angle = Phaser.Math.Between(options.angle[0], options.angle[1]) * Math.PI / 180;
            const speed = Phaser.Math.Between(50, 150);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            // Применяем скорость и гравитацию
            particle.setVelocity(velocityX, velocityY);
            particle.setGravityY(options.gravity);
            
            // Вращение в полете
            particle.setAngularVelocity(Phaser.Math.Between(-90, 90));
       
            // Анимация исчезновения
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0.5,
                duration: options.duration,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    public update(time: number, delta: number): void {
        // Обрабатываем обновление состояния дерева при необходимости
    }
}