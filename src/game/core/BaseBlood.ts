import * as Phaser from 'phaser';
import { createLogger } from '../../utils/logger';
import { generateStringWithLength } from '../../utils/stringGenerator';
import { settings } from '../settings';

const logger = createLogger('BaseBlood');

// Создаем различные ключи для разных типов текстур крови
const BLOOD_BASE_KEY = 'blood_particle_base_' + generateStringWithLength(6);
const BLOOD_DROPS_KEY = 'blood_drops_' + generateStringWithLength(6);
const BLOOD_SPLATTER_KEY = 'blood_splatter_' + generateStringWithLength(6);

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
    spread?: {                 // Разброс частиц
        angle: number;         // Угол разброса по горизонтали (в радианах)
        height: {              // Разброс по высоте (Y-координата)
            min: number;       // Минимальный разброс по высоте
            max: number;       // Максимальный разброс по высоте
        }
    };
    initialVelocityY?: {       // Начальная вертикальная скорость
        min: number;           // Минимальное значение
        max: number;           // Максимальное значение
    };
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
    textureType?: string;      // Тип текстуры ('basic', 'drops', 'splatter')
    minXDistance?: number;     // Минимальная дистанция разлета по оси X
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
    spread: {
        angle: Math.PI/7,
        height: {
            min: -5,
            max: 15
        }
    },
    initialVelocityY: {
        min: 15,
        max: 40
    },
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
    depth: 10,
    textureType: 'basic',
    minXDistance: 50           // Значение по умолчанию для минимальной дистанции по X
};

export class BaseBlood {
    private scene: Phaser.Scene;
    private bloodParticles: Phaser.GameObjects.Sprite[] = [];
    private texturesCreated: boolean = false;
    private decalTexture: Phaser.GameObjects.RenderTexture;
    
    /**
     * Конструктор системы крови
     * @param scene Сцена для размещения эффектов крови
     * @param decalTexture Опциональная внешняя текстура для декалей
     */
    constructor(scene: Phaser.Scene, decalTexture: Phaser.GameObjects.RenderTexture) {
        this.scene = scene;
        this.createBloodTextures();
        this.decalTexture = decalTexture;
    }
    
    /**
     * Создает различные текстуры для частиц крови
     */
    private createBloodTextures(): void {
        // Проверяем, созданы ли уже текстуры
        if (this.texturesCreated) {
            return;
        }
        
        this.createBasicBloodTexture();
        this.createBloodDropsTexture();
        this.createBloodSplatterTexture();
        
        this.texturesCreated = true;
        logger.debug('Созданы текстуры для частиц крови');
    }
    
    /**
     * Создает базовую текстуру для капель крови
     */
    private createBasicBloodTexture(): void {
        if (this.scene.textures.exists(BLOOD_BASE_KEY)) {
            return;
        }
        
        // Создаем графику для рисования частицы крови
        const graphics = this.scene.add.graphics();
        
        // Цвета для крови
        const darkRed = 0x8B0000;
        const brightRed = 0xFF0000;
        
        // Рисуем базовую каплю крови
        graphics.fillStyle(brightRed, 0.9);
        graphics.fillCircle(4, 4, 3);
        
        // Создаем текстуру из графики
        graphics.generateTexture(BLOOD_BASE_KEY, 8, 8);
        
        // Удаляем графику после создания текстуры
        graphics.destroy();
    }
    
    /**
     * Создает текстуру с несколькими каплями крови
     */
    private createBloodDropsTexture(): void {
        if (this.scene.textures.exists(BLOOD_DROPS_KEY)) {
            return;
        }
        
        // Создаем графику для рисования частицы крови с каплями
        const graphics = this.scene.add.graphics();
        
        // Цвета для крови
        const darkRed = 0x8B0000;
        const brightRed = 0xFF0000;
        
        // Рисуем основную каплю
        graphics.fillStyle(brightRed, 0.9);
        graphics.fillCircle(8, 8, 4);
        
        // Рисуем дополнительные маленькие капли
        graphics.fillCircle(14, 6, 2);
        graphics.fillCircle(4, 10, 2.5);
        graphics.fillCircle(12, 12, 1.5);
        
        // Добавляем темные участки для объема
        graphics.fillStyle(darkRed, 0.8);
        graphics.fillCircle(7, 7, 2);
        
        // Создаем текстуру из графики
        graphics.generateTexture(BLOOD_DROPS_KEY, 20, 20);
        
        // Удаляем графику после создания текстуры
        graphics.destroy();
    }
    
    /**
     * Создает текстуру брызг крови с пятнами
     */
    private createBloodSplatterTexture(): void {
        if (this.scene.textures.exists(BLOOD_SPLATTER_KEY)) {
            return;
        }
        
        // Создаем графику для рисования брызг
        const graphics = this.scene.add.graphics();
        
        // Цвета для крови
        const darkRed = 0x8B0000;
        const brightRed = 0xFF0000;
        
        // Рисуем большое центральное пятно
        graphics.fillStyle(brightRed, 0.85);
        graphics.fillCircle(15, 15, 8);
        
        // Добавляем брызги в разные стороны
        graphics.fillStyle(brightRed, 0.7);
        
        // Брызги в разных направлениях
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const distance = Phaser.Math.Between(8, 15);
            const x = 15 + Math.cos(angle) * distance;
            const y = 15 + Math.sin(angle) * distance;
            const size = Phaser.Math.FloatBetween(1, 4);
            graphics.fillCircle(x, y, size);
        }
        
        // Добавляем темные участки для объема
        graphics.fillStyle(darkRed, 0.8);
        graphics.fillCircle(13, 13, 4);
        
        // Создаем текстуру из графики
        graphics.generateTexture(BLOOD_SPLATTER_KEY, 30, 30);
        
        // Удаляем графику после создания текстуры
        graphics.destroy();
    }
    
    /**
     * Возвращает ключ текстуры в зависимости от настройки типа
     */
    private getTextureKey(textureType: string): string {
        switch (textureType) {
            case 'drops':
                return BLOOD_DROPS_KEY;
            case 'splatter':
                return BLOOD_SPLATTER_KEY;
            case 'basic':
            default:
                return BLOOD_BASE_KEY;
        }
    }
    
    /**
     * Создает композитную частицу крови с несколькими каплями
     */
    private createCompositeBloodParticle(
        x: number,
        y: number,
        settings: BloodSplashOptions
    ): Phaser.Physics.Arcade.Sprite {
        // Создаем основную частицу
        const baseTextureKey = this.getTextureKey(settings.textureType!);
        const bloodParticle = this.scene.physics.add.sprite(x, y, baseTextureKey);
        return bloodParticle;
    }
    
    /**
     * Добавляет частицу крови на постоянный слой декалей и удаляет оригинальный спрайт
     */
    private addToDecalLayer(particle: Phaser.GameObjects.Sprite): void {
        // Рендерим частицу в текстуру на её текущей позиции
        this.drawDecal(particle);
        
        // Удаляем частицу из массива активных частиц
        const index = this.bloodParticles.indexOf(particle);
        if (index !== -1) {
            this.bloodParticles.splice(index, 1);
        }
        
        // Уничтожаем оригинальный спрайт частицы
        particle.destroy();
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
        splashOptions?: Partial<BloodSplashOptions>
    ): void {
        if (!settings.gameplay.blood.enabled) {
            return;
        }
        // Объединяем переданные параметры с дефолтными
        const options = { ...defaultBloodOptions, ...splashOptions };
 
        // Создаем массив для физических брызг
        const physicsParticles: Phaser.Physics.Arcade.Sprite[] = [];
        
        // Вычисляем максимальную высоту падения для псевдо-3D
        const maxFallDistance = Phaser.Math.Between(
            options.fallDistance!.min, 
            options.fallDistance!.max
        );
        
        // Создаем новые частицы крови с физикой
        for (let i = 0; i < options.amount!; i++) {
            // Применяем разброс по высоте для начальной позиции частицы
            const heightSpread = Phaser.Math.Between(
                options.spread!.height.min,
                options.spread!.height.max
            );
            
            // Создаем композитную частицу крови с учетом настроек капель
            const bloodParticle = this.createCompositeBloodParticle(
                x,
                y + heightSpread,
                options
            );
            
            // Устанавливаем размер, вращение и прозрачность
            bloodParticle.setScale(Phaser.Math.FloatBetween(
                options.size!.min, 
                options.size!.max
            ));
            bloodParticle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            bloodParticle.setAlpha(Phaser.Math.FloatBetween(
                options.alpha!.min, 
                options.alpha!.max
            ));
            
            // Устанавливаем глубину отображения
            bloodParticle.setDepth(options.depth!);
            
            // Отключаем стандартную коллизию с границами мира
            bloodParticle.setCollideWorldBounds(false);
            
            // Рассчитываем случайный угол разлета
            const spreadAngle = Phaser.Math.FloatBetween(
                -options.spread!.angle, 
                options.spread!.angle
            );
            const bulletAngle = (options.direction! > 0) ? 0 : Math.PI; // 0 - вправо, PI - влево
            const angle = bulletAngle + spreadAngle;
            
            // Вычисляем силу разлета
            const force = Phaser.Math.Between(
                options.speed!.min, 
                options.speed!.max
            ) * Math.min(Math.abs(options.direction!), 10) / 5;
            
            // Рассчитываем компоненты скорости с учетом настроек начальной вертикальной скорости
            let vx = Math.cos(angle) * force * options.speed!.multiplier;
            const initialYVelocity = Phaser.Math.Between(
                options.initialVelocityY!.min,
                options.initialVelocityY!.max
            );
            const vy = Math.sin(angle) * force - initialYVelocity;
            
            // Применяем минимальную дистанцию разлета по X, если она задана
            if (options.minXDistance && options.minXDistance > 0) {
                // Определяем направление по X
                const directionX = Math.sign(vx);
                
                // Если скорость по X ниже минимально необходимой для заданной дистанции,
                // корректируем её, сохраняя направление
                const minVxRequired = options.minXDistance * 0.2; // Коэффициент для примерного подбора скорости
                if (Math.abs(vx) < minVxRequired) {
                    vx = directionX * minVxRequired;
                }
            }
            
            // Применяем скорость
            bloodParticle.setVelocity(vx, vy);
            
            // Устанавливаем гравитацию
            bloodParticle.setGravityY(options.gravity!);
            
            // Добавляем вращение
            bloodParticle.setAngularVelocity(Phaser.Math.Between(
                options.rotation!.min, 
                options.rotation!.max
            ));
            
            // Настраиваем сопротивление
            bloodParticle.setDrag(options.drag!.x, options.drag!.y);
            
            // Сохраняем начальную позицию с учетом разброса по высоте
            bloodParticle.setData('initialY', y + heightSpread);
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
                            
                            // Добавляем частицу на слой декалей и удаляем её
                            this.addToDecalLayer(particle);
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
        
        logger.debug(`Создано ${options.amount} динамических частиц крови в позиции (${x}, ${y})`);
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
            spread: {
                angle: Math.PI/10,
                height: {
                    min: -3,
                    max: 8
                }
            },
            fallDistance: {
                min: 10,
                max: 20
            },
            textureType: 'basic'
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
            spread: {
                angle: Math.PI/4,
                height: {
                    min: -10,
                    max: 20
                }
            },
            gravity: 700,
            fallDistance: {
                min: 20,
                max: 35
            },
            textureType: 'splatter'
        });
    }
    
    /**
     * Создает брызги крови с широким разбросом по высоте
     * @param x Координата X
     * @param y Координата Y
     * @param direction Направление (-10 до 10)
     * @param heightRange Диапазон разброса по высоте
     */
    public createWideSplatterBloodSplash(
        x: number, 
        y: number, 
        direction: number, 
        heightRange: number = 30
    ): void {
        this.createBloodSplash(x, y, {
            amount: Phaser.Math.Between(8, 12),
            direction,
            speed: {
                min: 100,
                max: 200,
                multiplier: 0.5
            },
            spread: {
                angle: Math.PI/6,
                height: {
                    min: -heightRange/2,
                    max: heightRange/2
                }
            },
            gravity: 500,
            fallDistance: {
                min: 10,
                max: 25
            },
            textureType: 'drops'
        });
    }
    
    /**
     * Создает оптимизированные брызги крови - большая часть сразу попадает в декали
     */
    public createOptimizedBloodSplash(
        x: number, 
        y: number, 
        splashOptions?: Partial<BloodSplashOptions>
    ): void {
        if (!settings.gameplay.blood.enabled) {
            return;
        }
        
        // Объединяем переданные параметры с дефолтными
        const options = { ...defaultBloodOptions, ...splashOptions };
        
        // Большая часть частиц сразу рендерится в текстуру без физики
        this.createInstantBloodDecals(x, y, options);
        
        // Небольшое количество частиц создаем с физикой для визуального эффекта
        const animatedAmount = Math.min(10, Math.ceil(options.amount! / 10));
        
        // Создаем только небольшое количество частиц с физикой для визуального эффекта
        const reducedOptions = {
            ...options,
            amount: animatedAmount
        };
        
        // Создаем анимированные частицы (существенно меньше, чем в оригинале)
        this.createBloodSplash(x, y, reducedOptions);
    }
    
    /**
     * Создает статичные декали крови сразу в текстуру, без физики
     */
    private createInstantBloodDecals(
        x: number, 
        y: number, 
        options: BloodSplashOptions
    ): void {
        // Определяем направление брызг
        const directionFactor = options.direction! > 0 ? 1 : -1;
        
        // Количество статичных частиц
        const particleCount = options.amount! - Math.min(10, Math.ceil(options.amount! / 10));
        
        // Размеры области разброса
        const spreadWidth = 120;
        const spreadHeight = 80;
        
        for (let i = 0; i < particleCount; i++) {
            // Выбираем случайную текстуру
            const textureKey = this.getTextureKey(options.textureType!);
            
            // Случайное смещение с учетом направления
            let offsetX = Phaser.Math.FloatBetween(-spreadWidth/2, spreadWidth/2);
            // Добавляем направленность
            offsetX += directionFactor * Math.abs(offsetX) * 0.5;
            
            const offsetY = Phaser.Math.FloatBetween(
                options.spread!.height.min,
                options.spread!.height.max
            );
            
            // Случайное расстояние падения
            const fallDistance = Phaser.Math.FloatBetween(
                options.fallDistance!.min, 
                options.fallDistance!.max
            );
            
            // Создаем временный спрайт
            const tempSprite = this.scene.add.sprite(
                x + offsetX,
                y + offsetY + fallDistance, // Сразу добавляем дистанцию падения
                textureKey
            );
            
            // Настраиваем его параметры
            tempSprite.setScale(Phaser.Math.FloatBetween(
                options.size!.min, 
                options.size!.max
            ));
            tempSprite.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            tempSprite.setAlpha(Phaser.Math.FloatBetween(
                options.alpha!.min, 
                options.alpha!.max
            ));
            
            // Сразу рендерим его в текстуру
            this.drawDecal(tempSprite);
            
            // Уничтожаем временный спрайт
            tempSprite.destroy();
        }
    }
    
    drawDecal(particle: Phaser.GameObjects.Sprite): void {
        if (!settings.gameplay.blood.keepDecals) {
            return;
        }
        this.decalTexture.draw(particle, particle.x, particle.y);
    }


}