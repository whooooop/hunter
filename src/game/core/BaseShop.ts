import { createLogger } from "../../utils/logger";
import { settings } from "../settings";
import { COLORS } from "./Constants";
import { hexToNumber } from "../utils/colors";

const logger = createLogger('Shop');

import weaponSlotImage from '../../assets/images/weapon_slot.png';

const weaponSlotTexture = 'weapon_slot_0';

const interactiveBlockColor = hexToNumber(COLORS.INTERACTIVE_BUTTON_BACKGROUND);
const interactiveBlockBorderColor = hexToNumber(COLORS.INTERACTIVE_BUTTON_BORDER);
const interactiveBlockTextColor = hexToNumber(COLORS.INTERACTIVE_BUTTON_TEXT);

interface ShopOptions {
    texture: string;
    scale: number;
    interactionRadius: number; // Радиус взаимодействия
    debug: boolean;
    depthOffset?: number;
}

export class BaseShop extends Phaser.GameObjects.Sprite {
    protected options: ShopOptions;
    protected interactionZone!: Phaser.GameObjects.Zone;
    protected interactionIcon!: Phaser.GameObjects.Sprite;
    protected interactionText!: Phaser.GameObjects.Text;
    protected isPlayerNearby: boolean = false;
    protected isShopOpen: boolean = false;
    
    constructor(scene: Phaser.Scene, x: number, y: number, options: ShopOptions) {
        super(scene, x, y, options.texture, 0);
        this.options = { 
            ...options
        };
        
        this.setScale(this.options.scale);
        
        // Устанавливаем глубину отображения
        this.setDepth(y + this.height / 2 * this.scale + settings.gameplay.depthOffset + (this.options.depthOffset || 0));
        
        // Создаем зону взаимодействия
        this.createInteractionZone();
        
        // Создаем иконку взаимодействия (пока скрыта)
        this.createInteractionIcon();
    }
    
    static preload(scene: Phaser.Scene): void {
        scene.load.image(weaponSlotTexture, weaponSlotImage);
    }

    /**
     * Создает зону взаимодействия вокруг магазина
     */
    protected createInteractionZone(): void {
        // Создаем зону вокруг магазина
        this.interactionZone = this.scene.add.zone(
            this.x, 
            this.y, 
            this.options.interactionRadius * 2, 
            this.options.interactionRadius * 2
        );
        
        // Делаем зону невидимой
        this.interactionZone.setVisible(false);
        
        // Визуальное отображение зоны для отладки
        if (this.options.debug) {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00);
            graphics.setDepth(1000);
            graphics.strokeCircle(this.x, this.y, this.options.interactionRadius);
        }
    }
    
    /**
     * Создает иконку взаимодействия над магазином
     */
    protected createInteractionIcon(): void {
        if (!this.scene) return;
        
        // Создаем текст-подсказку над магазином
        this.interactionText = this.scene.add.text(
            150,
            50,
            'Нажмите E для взаимодействия',
            {
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        
        if (this.interactionText) {
            this.interactionText.setOrigin(0.5);
            this.interactionText.setVisible(false);
            this.interactionText.setDepth(100);
        }
        
        // Иконку можно добавить здесь, если есть текстура
    }
    
    public setPlayerNearby(isNearby: boolean): void {
        this.isPlayerNearby = isNearby;
        if (this.isPlayerNearby) {
            this.showInteractionPrompt();
        } else {
            this.hideInteractionPrompt();
        }
    }

    /**
     * Стандартный метод update (переопределение метода Sprite)
     */
    public update(time: number, delta: number): void {
        // Проверяем нажатие клавиши взаимодействия
        if (this.isPlayerNearby && this.isInteractionKeyPressed()) {
            this.onInteract();
        }
    }
    
    /**
     * Проверяет, нажата ли клавиша взаимодействия
     */
    protected isInteractionKeyPressed(): boolean {
        if (!this.scene || !this.scene.input || !this.scene.input.keyboard) return false;
        
        // Проверка нажатия клавиши E
        const keys = this.scene.input.keyboard;
        
        return Phaser.Input.Keyboard.JustDown(
            keys.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        );
    }
    
    /**
     * Показывает подсказку для взаимодействия
     */
    public showInteractionPrompt(): void {
        if (!this.interactionText || !this.scene) return;
        this.interactionText.setVisible(true);
    }

    public getInteractionRadius(): number {
        return this.options.interactionRadius;
    }
    
    /**
     * Скрывает подсказку для взаимодействия
     */
    public hideInteractionPrompt(): void {
        if (!this.interactionText || !this.scene) return;
        
        this.interactionText.setVisible(false);
        this.scene.tweens.killTweensOf(this.interactionText);
    }
    
    /**
     * Переопределяем действие при взаимодействии с магазином
     */
    protected onInteract(): void {
        if (!this.scene) return;
        
        if (!this.isShopOpen) {
            this.openShop();
        } else {
            this.closeShop();
        }
    }
    
    /**
     * Открывает интерфейс магазина
     */
    private openShop(): void {
        this.isShopOpen = true;
        
        // Создаем основной контейнер интерфейса
        const shopUI = this.scene.add.container(0, 0);
        shopUI.setDepth(1000);
        shopUI.setScrollFactor(0); // Фиксирует UI на экране
        shopUI.setAlpha(0); // Начинаем с полностью прозрачного состояния
        
        // Отрисовываем внутренний круг с 4 слотами
        const innerCircle = this.drawCircleWithSlots(shopUI, {
            circleRadius: 520 / 2,          // Радиус 260px
            slotCount: 4,                   // 4 слота
            slotSize: 126,                  // Размер слота 126px
            marginFromEdge: 10,             // Отступ от края круга
            startAngle: Math.PI / 1.9,      // Начальный угол
            angleMargin: Math.PI / 1.5,     // Угловой отступ
            gradientSize: 50,               // Размер градиента
            gradientAlphaStart: 0.5,        // Начальная прозрачность градиента
            centerOffset: { x: 100, y: 250 }, // Индивидуальное смещение для этого круга
            zIndexBase: 1000,               // Базовый Z-индекс
            position: { x: -260, y: -290 }   // Позиция круга
        });
        
        // Отрисовываем внешний круг с 6 слотами
        const outerCircle = this.drawCircleWithSlots(shopUI, {
            circleRadius: 810 / 2,          // Радиус 405px (больше первого)
            slotCount: 6,                   // 6 слотов
            slotSize: 126,                  // Размер слота такой же
            marginFromEdge: 10,             // Чуть больший отступ
            startAngle: Math.PI / 1.9,        // Начальный угол (вверх)
            angleMargin: Math.PI / 1.6,      // Меньший угловой отступ для большего распределения
            gradientSize: 100,               // Чуть больший градиент
            gradientAlphaStart: 0.4,        // Меньшая прозрачность для внешнего круга
            centerOffset: { x: 0, y: 0 },   // Отдельное смещение центра
            zIndexBase: 900,                // Меньший Z-индекс чтобы был под первым кругом
            position: { x: -290, y: -170 }   // Своя позиция для внешнего круга
        });
        
        // Сохраняем ссылку на UI
        this.scene.registry.set('shopUI', shopUI);
        
        // Анимация появления всего интерфейса
        shopUI.setAlpha(0);
        this.scene.tweens.add({
            targets: shopUI,
            alpha: 1,
            duration: 200,
            ease: 'Back.out'
        });
        
        // Анимация появления для внутреннего круга - масштабирование
        innerCircle.setScale(0.8);
        this.scene.tweens.add({
            targets: innerCircle,
            scale: 1,
            duration: 200,
            ease: 'Back.out',
        });
        
        // Анимация появления для внешнего круга - масштабирование с задержкой
        outerCircle.setScale(0.8);
        this.scene.tweens.add({
            targets: outerCircle,
            scale: 1,
            duration: 200,
            ease: 'Back.out',
            delay: 20
        });
    }
    
    /**
     * Создает круг с указанным количеством слотов внутри
     * @param container - контейнер для добавления графики
     * @param options - параметры отрисовки круга и слотов
     * @returns Контейнер круга для возможности анимаций
     */
    private drawCircleWithSlots(container: Phaser.GameObjects.Container, options: {
        circleRadius: number,       // Радиус основного круга
        slotCount: number,          // Количество слотов
        slotSize: number,           // Размер слота
        marginFromEdge: number,     // Отступ от края круга
        startAngle: number,         // Начальный угол
        angleMargin: number,        // Угловой отступ 
        gradientSize: number,       // Размер градиента
        gradientAlphaStart: number, // Начальная прозрачность градиента
        centerOffset: { x: number, y: number }, // Смещение центра
        zIndexBase: number,         // Базовый Z-индекс для слоя
        position: { x: number, y: number }  // Позиция круга относительно контейнера
    }): Phaser.GameObjects.Container {
        // Создаем отдельный контейнер для этого круга с его позицией
        const circleContainer = this.scene.add.container(options.position.x, options.position.y);
        circleContainer.setDepth(options.zIndexBase);
        
        // Радиус слота (половина размера)
        const slotRadius = options.slotSize / 2;
        
        // Создаем большой круг с внутренней тенью
        const circleGraphics = this.scene.add.graphics();
        circleGraphics.setDepth(options.zIndexBase);
        
        // Центр круга с учетом смещения
        const centerX = options.circleRadius + options.centerOffset.x;
        const centerY = options.circleRadius + options.centerOffset.y;
        
        // Создаем внутренний градиент от края к центру
        for (let i = 0; i < options.gradientSize; i++) {
            // Прозрачный градиент
            const alpha = options.gradientAlphaStart - (i / options.gradientSize * options.gradientAlphaStart);
            const radius = options.circleRadius - i;
            
            if (radius <= 0) break;
            
            // Линия внутренней тени
            circleGraphics.lineStyle(1, interactiveBlockBorderColor, alpha);
            
            // Рисуем полный круг с центром в (centerX, centerY)
            circleGraphics.beginPath();
            circleGraphics.arc(centerX, centerY, radius, 0, Math.PI * 2);
            circleGraphics.strokePath();
        }
        
        // Добавляем круг в контейнер
        circleContainer.add(circleGraphics);
        
        // Радиус, на котором размещаем слоты
        const placementRadius = options.circleRadius - slotRadius - options.marginFromEdge;
        
        // Настраиваем угловой диапазон для размещения слотов
        const endAngle = Math.PI / 2 - options.angleMargin; // Конечный угол
        const angleRange = endAngle - options.startAngle; // Диапазон углов
        
        // Вычисляем положение каждого слота
        for (let i = 0; i < options.slotCount; i++) {
            // Равномерно распределяем по дуге с заданными границами
            // Если один слот, ставим его по центру диапазона
            const angle = options.slotCount === 1 
                ? options.startAngle + angleRange / 2 
                : options.startAngle + (i / (options.slotCount - 1)) * angleRange;
            
            // Вычисляем координаты относительно центра большого круга
            const x = centerX + Math.cos(angle) * placementRadius;
            const y = centerY + Math.sin(angle) * placementRadius;
            
            // Создаем спрайт слота с текстурой weaponSlotTexture
            const weaponSlot = this.scene.add.sprite(x, y, weaponSlotTexture);
            weaponSlot.setScale(options.slotSize / weaponSlot.width); // Масштабируем до нужного размера
            weaponSlot.setDepth(options.zIndexBase + 1);
            
            // Добавляем номер в центр слота
            const slotText = this.scene.add.text(x, y, `${i+1}`, {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold'
            });
            slotText.setOrigin(0.5);
            slotText.setDepth(options.zIndexBase + 2);
            
            // Делаем слоты интерактивными
            weaponSlot.setInteractive();
            weaponSlot.on('pointerdown', () => {
                console.log(`Выбран слот ${i+1}`);
                // Здесь можно добавить логику выбора оружия
            });
            
            // Добавляем слот и текст в контейнер круга
            circleContainer.add(weaponSlot);
            circleContainer.add(slotText);
        }
        
        // Добавляем контейнер круга в основной контейнер
        container.add(circleContainer);
        
        return circleContainer;
    }
    
    /**
     * Закрывает интерфейс магазина
     */
    private closeShop(): void {
        this.isShopOpen = false;
        const shopUI = this.scene.registry.get('shopUI') as Phaser.GameObjects.Container;
        
        if (shopUI) {
            // Анимация исчезновения UI
            this.scene.tweens.add({
                targets: shopUI,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    // Уничтожаем после завершения анимации
                    shopUI.destroy();
                    this.scene.registry.remove('shopUI');
                }
            });
            
            // Находим контейнеры кругов для отдельных анимаций
            shopUI.getAll().forEach((gameObject: Phaser.GameObjects.GameObject, index: number) => {
                if (gameObject instanceof Phaser.GameObjects.Container) {
                    // Анимация уменьшения для каждого круга с небольшой задержкой
                    this.scene.tweens.add({
                        targets: gameObject,
                        scale: 0.8,
                        y: gameObject.y + 50, // Добавляем смещение вниз при исчезновении
                        duration: 200,
                        ease: 'Back.in'
                    });
                }
            });
        }
    }

    /**
     * Уничтожение объекта
     */
    public destroy(): void {
        if (this.interactionZone) this.interactionZone.destroy();
        if (this.interactionText) this.interactionText.destroy();

        super.destroy();
    }
}