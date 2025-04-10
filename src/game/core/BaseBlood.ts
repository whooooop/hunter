import * as Phaser from 'phaser';
import { createLogger } from '../../utils/logger';
import { generateStringWithLength } from '../../utils/stringGenerator';
import { settings } from '../settings';

const logger = createLogger('BaseBlood');

const BLOOD_TEXTURE_KEY = 'blood_particle_' + generateStringWithLength(6);

// Интерфейс с параметрами для настройки эффекта брызг крови
export interface BloodSplashOptions {
    amount?: number;           // Количество частиц
    direction?: number;        // Направление (-10 до 10), где 0 - вертикально вверх
    size?: {                   // Размер частиц
        min: number;           // Минимальный размер (масштаб)
        max: number;           // Максимальный размер (масштаб)
    };
    speed?: {                  // Скорость частиц
        min: number;           // Минимальная начальная скорость
        max: number;           // Максимальная начальная скорость
        multiplier: number;    // Множитель скорости (0-1 для замедления, >1 для ускорения)
    };
    gravity?: number;          // Сила гравитации
    spread?: number;           // Угол разброса (в радианах)
    fallDistance?: {           // Максимальная дистанция падения
        min: number;          
        max: number;
    };
    drag?: {                   // Сопротивление воздуха
        x: number;
        y: number;
    };
    rotation?: {               // Скорость вращения
        min: number;
        max: number;
    };
    alpha?: {                  // Прозрачность
        min: number;
        max: number;
    };
    depth?: number;            // Приоритет отображения частиц (фиксированная глубина)
}

// Дефолтные настройки для эффекта крови
const defaultBloodOptions: BloodSplashOptions = {
    amount: 5,
    direction: 0,
    size: {
        min: 0.3,
        max: 0.7
    },
    speed: {
        min: 100,
        max: 180,
        multiplier: 0.6
    },
    gravity: 600,
    spread: Math.PI/7,
    fallDistance: {
        min: 15,
        max: 25
    },
    drag: {
        x: 20,
        y: 10
    },
    rotation: {
        min: -150,
        max: 150
    },
    alpha: {
        min: 0.6,
        max: 0.9
    },
    depth: 10
};

export class BaseBlood {
    private scene: Phaser.Scene;
    private bloodParticles: Phaser.GameObjects.Sprite[] = [];
    private maxParticles: number = 5000; // Максимальное количество частиц крови на сцене
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createBloodTexture();
    }
    
    /**
     * Создает текстуру для частиц крови
     */
    private createBloodTexture(): void {
        // Проверяем, существует ли уже такая текстура
        if (this.scene.textures.exists(BLOOD_TEXTURE_KEY)) {
            return; // Используем существующую текстуру
        }
        
        // Создаем графику для рисования частицы крови
        const graphics = this.scene.add.graphics();
        
        // Цвета для крови
        const darkRed = 0x8B0000;
        const brightRed = 0xFF0000;
        
        // Рисуем несколько вариантов брызг крови
        graphics.fillStyle(brightRed, 0.9);
        
        // Вариант 1: капля крови
        graphics.fillCircle(4, 4, 3);
        
        // Вариант 2: брызги
        graphics.fillCircle(12, 4, 2);
        graphics.fillCircle(14, 6, 1.5);
        graphics.fillCircle(10, 3, 1);
        
        // Вариант 3: пятно
        graphics.fillStyle(darkRed, 0.8);
        graphics.fillCircle(20, 4, 2.5);
        graphics.fillCircle(21, 5, 2);
        
        // Создаем текстуру из графики (размер 24x8)
        graphics.generateTexture(BLOOD_TEXTURE_KEY, 24, 8);
        
        // Удаляем графику после создания текстуры
        graphics.destroy();
        
        logger.debug('Создана текстура для частиц крови');
    }
    
    /**
     * Создает брызги крови в указанной позиции с настраиваемыми параметрами
     * @param x Координата X
     * @param y Координата Y
     * @param options Настройки эффекта брызг крови
     */
    public createBloodSplash(
        x: number, 
        y: number, 
        options?: Partial<BloodSplashOptions>
    ): void {
        // Объединяем переданные параметры с дефолтными
        const settings = { ...defaultBloodOptions, ...options };
        
        // Проверяем, не превышен ли лимит частиц
        if (this.bloodParticles.length >= this.maxParticles) {
            // Удаляем самые старые частицы
            const removeCount = Math.min(settings.amount!, this.bloodParticles.length);
            for (let i = 0; i < removeCount; i++) {
                const oldestParticle = this.bloodParticles.shift();
                if (oldestParticle) {
                    oldestParticle.destroy();
                }
            }
        }
        
        // Создаем массив для физических брызг
        const physicsParticles: Phaser.Physics.Arcade.Sprite[] = [];
        
        // Вычисляем максимальную высоту падения для псевдо-3D
        const maxFallDistance = Phaser.Math.Between(
            settings.fallDistance!.min, 
            settings.fallDistance!.max
        );
        
        // Создаем новые частицы крови с физикой
        for (let i = 0; i < settings.amount!; i++) {
            // Создаем спрайт для частицы крови с физикой
            const bloodParticle = this.scene.physics.add.sprite(x, y, BLOOD_TEXTURE_KEY);
            
            // Устанавливаем размер, вращение и прозрачность
            bloodParticle.setScale(Phaser.Math.FloatBetween(
                settings.size!.min, 
                settings.size!.max
            ));
            bloodParticle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            bloodParticle.setAlpha(Phaser.Math.FloatBetween(
                settings.alpha!.min, 
                settings.alpha!.max
            ));
            
            // Устанавливаем глубину отображения
            bloodParticle.setDepth(settings.depth!);
            
            // Отключаем стандартную коллизию с границами мира
            bloodParticle.setCollideWorldBounds(false);
            
            // Рассчитываем случайный угол разлета
            const spreadAngle = Phaser.Math.FloatBetween(-settings.spread!, settings.spread!);
            const bulletAngle = (settings.direction! > 0) ? 0 : Math.PI; // 0 - вправо, PI - влево
            const angle = bulletAngle + spreadAngle;
            
            // Вычисляем силу разлета
            const force = Phaser.Math.Between(
                settings.speed!.min, 
                settings.speed!.max
            ) * Math.min(Math.abs(settings.direction!), 10) / 5;
            
            // Рассчитываем компоненты скорости
            const vx = Math.cos(angle) * force * settings.speed!.multiplier;
            const vy = Math.sin(angle) * force - Phaser.Math.Between(15, 40);
            
            // Применяем скорость
            bloodParticle.setVelocity(vx, vy);
            
            // Устанавливаем гравитацию
            bloodParticle.setGravityY(settings.gravity!);
            
            // Добавляем вращение
            bloodParticle.setAngularVelocity(Phaser.Math.Between(
                settings.rotation!.min, 
                settings.rotation!.max
            ));
            
            // Настраиваем сопротивление
            bloodParticle.setDrag(settings.drag!.x, settings.drag!.y);
            
            // Сохраняем начальную позицию и максимальную дистанцию падения для псевдо-3D
            bloodParticle.setData('initialY', y);
            bloodParticle.setData('maxFallDistance', maxFallDistance);
            
            // Добавляем в массив частиц
            this.bloodParticles.push(bloodParticle);
            physicsParticles.push(bloodParticle);
        }
        
        // Настраиваем обработку движения и остановки частиц для псевдо-3D
        const particleUpdateEvent = this.scene.time.addEvent({
            delay: 10, // Обновление для плавного движения
            callback: () => {
                let allStopped = true;
                
                physicsParticles.forEach(particle => {
                    if (particle.active) {
                        // Получаем сохраненные данные
                        const initialY = particle.getData('initialY') as number;
                        const maxFallDistance = particle.getData('maxFallDistance') as number;
                        
                        // Проверяем, не превысили ли мы максимальную дистанцию падения для псевдо-3D
                        if (particle.y >= initialY + maxFallDistance) {
                            // Если частица упала на максимальное расстояние - останавливаем ее
                            particle.setVelocity(0, 0);
                            particle.setAngularVelocity(0);
                            particle.setGravityY(0);
                            particle.setDrag(0, 0);
                            
                            // Отключаем физику, оставляя частицу видимой
                            particle.disableBody(true, false);
                        } else {
                            // Умеренное ускорение падения по мере движения
                            if (particle.body && particle.body.velocity.y < 200) {
                                particle.body.velocity.y += 10;
                            }
                            
                            // Умеренное замедление горизонтального движения
                            if (particle.body && Math.abs(particle.body.velocity.x) > 15) {
                                particle.body.velocity.x *= 0.95;
                            }
                            
                            allStopped = false;
                        }
                    }
                });
                
                // Если все частицы остановились, отключаем обновление
                if (allStopped) {
                    particleUpdateEvent.destroy();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        logger.debug(`Создано ${settings.amount} динамических частиц крови в позиции (${x}, ${y})`);
    }
    
    /**
     * Создает брызги крови с предустановленным эффектом для пистолетного выстрела
     * @param x Координата X
     * @param y Координата Y
     * @param direction Направление (-10 до 10)
     */
    public createPistolBloodSplash(x: number, y: number, direction: number): void {
        this.createBloodSplash(x, y, {
            amount: Phaser.Math.Between(3, 5),
            direction,
            speed: {
                min: 80,
                max: 120,
                multiplier: 0.5
            },
            gravity: 400,
            fallDistance: {
                min: 10,
                max: 20
            }
        });
    }
    
    /**
     * Создает брызги крови с предустановленным эффектом для выстрела из дробовика
     * @param x Координата X
     * @param y Координата Y
     * @param direction Направление (-10 до 10)
     */
    public createShotgunBloodSplash(x: number, y: number, direction: number): void {
        this.createBloodSplash(x, y, {
            amount: Phaser.Math.Between(10, 15),
            direction,
            size: {
                min: 0.3, 
                max: 0.9
            },
            speed: {
                min: 150,
                max: 250,
                multiplier: 0.8
            },
            spread: Math.PI/4,
            gravity: 700,
            fallDistance: {
                min: 20,
                max: 35
            }
        });
    }
    
    /**
     * Очищает все частицы крови со сцены
     */
    public clearAllBlood(): void {
        this.bloodParticles.forEach(particle => particle.destroy());
        this.bloodParticles = [];
        logger.debug('Все частицы крови очищены');
    }
    
    /**
     * Устанавливает максимальное количество частиц крови
     * @param count Максимальное количество частиц
     */
    public setMaxParticles(count: number): void {
        this.maxParticles = count;
        
        // Если текущее количество превышает новый максимум, удаляем лишние
        if (this.bloodParticles.length > this.maxParticles) {
            const removeCount = this.bloodParticles.length - this.maxParticles;
            for (let i = 0; i < removeCount; i++) {
                const oldestParticle = this.bloodParticles.shift();
                if (oldestParticle) {
                    oldestParticle.destroy();
                }
            }
        }
    }
}