import { createLogger } from "../../utils/logger";
import { settings } from "../settings";
import { COLORS } from "./Constants";
import { hexToNumber } from "../utils/colors";
import { WeaponType } from "../weapons/WeaponTypes";
import { getWeaponConfig } from "../weapons";
import { emitEvent } from "./Events";

const logger = createLogger('Shop');

import weaponSlotImage from '../../assets/images/weapon_slot.png';
import { ShopWeapon, ShopSlotElement, ShopEvents } from "./types/shopTypes";
import { Weapon } from "./types/weaponTypes";
import { ScoreEvents } from "./types/scoreTypes";

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
    
    // Храним ID ближайшего игрока, а не просто флаг
    protected nearbyPlayerId: string | null = null;
    protected isShopOpen: boolean = false;
    protected weapons: ShopWeapon[] = [];

    // Состояние для открытого магазина
    protected currentPlayerId: string | null = null;
    protected currentPlayerBalance: number = 0;
    protected purchasedWeaponTypes: Set<WeaponType> = new Set();
    protected currentShopUI: Phaser.GameObjects.Container | null = null;
    protected currentSlotElements: Map<WeaponType, ShopSlotElement> = new Map();
    
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
    protected createInteractionIcon(): void {}

    public setNearbyPlayer(isNearby: boolean): void {
        if (isNearby) {
            this.showInteractionPrompt();
        } else {
            this.hideInteractionPrompt();

            // Если игрок отошел во время открытого магазина, закрываем его
            if (this.isShopOpen) {
                this.closeShop();
            }
        }
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
     * Открывает интерфейс магазина для конкретного игрока
     * @param playerId ID игрока
     */
    public openShop(playerId: string, playerBalance: number, playerPurchasedWeapons: Set<WeaponType>, weapons: ShopWeapon[]): void {
        if (this.isShopOpen) return; // Не открывать, если уже открыт

        this.isShopOpen = true;
        this.currentPlayerId = playerId;
        this.currentPlayerBalance = playerBalance
        this.purchasedWeaponTypes = playerPurchasedWeapons;
        this.weapons = weapons;
        this.currentSlotElements.clear(); // Очищаем старые элементы слотов
        
        // Создаем основной контейнер интерфейса
        const shopUI = this.scene.add.container(0, 0);
        shopUI.setDepth(1000);
        shopUI.setScrollFactor(0); // Фиксирует UI на экране
        shopUI.setAlpha(0); // Начинаем с полностью прозрачного состояния
        this.currentShopUI = shopUI; // Сохраняем ссылку
        
        // Определяем количество слотов
        const innerMaxSlots = 4;
        const outerMaxSlots = 6;
        
        // Разделяем оружие для кругов
        const weaponsForInner = this.weapons.slice(0, innerMaxSlots);
        const weaponsForOuter = this.weapons.slice(innerMaxSlots, innerMaxSlots + outerMaxSlots);

        // Отрисовываем внутренний круг с 4 слотами
        const innerCircle = this.drawCircleWithSlots(shopUI, {
            circleRadius: 520 / 2,          // Радиус 260px
            slotCount: innerMaxSlots,        // Макс слотов
            assignedWeapons: weaponsForInner,// Передаем оружие
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
            slotCount: outerMaxSlots,        // Макс слотов
            assignedWeapons: weaponsForOuter,// Передаем оружие
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
        
        // Вызываем обновление доступности ПОСЛЕ создания всех слотов
        this.updateSlotsAvailability();
        
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
        assignedWeapons: ShopWeapon[];
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
        
        const totalSlotsToDraw = options.slotCount; // Рисуем все слоты, чтобы сохранить позиционирование

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
            
            // Получаем данные об оружии для этого слота, если они есть
            const weaponData = options.assignedWeapons[i];
            
            // Рисуем фоновый спрайт слота
            const slotBackground = this.scene.add.sprite(x, y, weaponSlotTexture);
            slotBackground.setScale(options.slotSize / slotBackground.width);
            slotBackground.setDepth(options.zIndexBase + 1);
            // slotBackground.setInteractive(); // Сделаем интерактивным, чтобы закрывать магазин при клике на пустое место
            // slotBackground.on('pointerdown', () => {
            //     this.closeShop();
            // });
            
            if (weaponData) {
                const config: Weapon.Config | undefined = getWeaponConfig(weaponData.type);
                if (config && config.texture) {
                    // Рисуем иконку оружия
                    const weaponIcon = this.scene.add.sprite(x, y, config.texture.key);
                    // Масштабируем иконку, чтобы она помещалась в слот с небольшим отступом
                    const iconScale = (options.slotSize * 0.4) / (weaponIcon.height || 1);
                    weaponIcon.setScale(iconScale);
                    weaponIcon.setDepth(options.zIndexBase + 2); // Иконка над фоном

                    // Рисуем цену под иконкой
                    const priceText = this.scene.add.text(x, y + slotRadius * 0.7, weaponData.price.toString(), {
                        fontFamily: settings.fontFamily,
                        fontSize: `${Math.round(options.slotSize * 0.22)}px`, // Размер шрифта зависит от размера слота
                        color: COLORS.INTERACTIVE_BUTTON_TEXT,
                        stroke: '#000000',
                        strokeThickness: 2,
                        fontStyle: 'bold'
                    });
                    priceText.setOrigin(0.5, 0.5);
                    priceText.setDepth(options.zIndexBase + 3); // Текст над иконкой

                    // Сохраняем элементы для обновления доступности
                    this.currentSlotElements.set(weaponData.type, { 
                        background: slotBackground,
                        icon: weaponIcon,
                        priceText: priceText,
                        weaponData: weaponData
                    });

                    // Обработчик клика для покупки
                    weaponIcon.setInteractive(); 
                    weaponIcon.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                        pointer.event.stopPropagation(); // Останавливаем всплытие

                        if (!this.currentPlayerId) return;

                        // Проверяем, можно ли купить
                        const canAfford = weaponData.price <= this.currentPlayerBalance;
                        const isPurchased = this.purchasedWeaponTypes.has(weaponData.type);

                        if (canAfford && !isPurchased) {
                            this.purchasedWeapon(weaponData.type);
                            this.closeShop();
                        } else if (isPurchased) {
                            // Можно добавить звук "уже куплено"
                        } else {
                            // Можно добавить звук "не хватает денег"
                        }
                    });

                    // Добавляем фон, иконку и текст в контейнер
                    circleContainer.add(slotBackground);
                    circleContainer.add(weaponIcon);
                    circleContainer.add(priceText);

                } else {
                    // Если конфиг не найден, делаем слот невидимым (как пустой)
                    slotBackground.setVisible(false);
                    // Сохраняем только фон, чтобы он мог быть скрыт/показан
                    this.currentSlotElements.set(weaponData.type, { 
                        background: slotBackground,
                        weaponData: weaponData
                    });
                    circleContainer.add(slotBackground);
                }
            } else {
                // Если оружия для этого слота нет, делаем фон невидимым
                slotBackground.setVisible(false);
                // Не сохраняем в currentSlotElements, так как тут нет оружия
                circleContainer.add(slotBackground);
            }
        }
        
        // Добавляем контейнер круга в основной контейнер
        container.add(circleContainer);
        
        return circleContainer;
    }
    
    protected purchasedWeapon(weaponType: WeaponType): void {
      const weaponData = this.weapons.find(weapon => weapon.type === weaponType)!;

      emitEvent(this.scene, ShopEvents.WeaponPurchasedEvent, { 
        playerId: this.currentPlayerId!, 
        price: weaponData.price,
        weaponType: weaponType
      });

      emitEvent(this.scene, ScoreEvents.DecreaseScoreEvent, { 
          playerId: this.currentPlayerId!, 
          score: weaponData.price
      });

      this.purchasedWeaponTypes.add(weaponType);
      this.updateSlotsAvailability();
    }

    /**
     * Закрывает интерфейс магазина
     */
    private closeShop(): void {
        if (!this.isShopOpen) return; // Не закрывать, если уже закрыт

        this.isShopOpen = false; // Сначала меняем флаг
        const shopUIToClose = this.currentShopUI; // Сохраняем ссылку для анимации

        if (shopUIToClose) {
            // Анимация исчезновения UI
            this.scene.tweens.add({
                targets: shopUIToClose,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    // Уничтожаем после завершения анимации
                    shopUIToClose.destroy();
                }
            });
            
            // Находим контейнеры кругов для отдельных анимаций
            shopUIToClose.getAll().forEach((gameObject: Phaser.GameObjects.GameObject) => {
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

        // Сбрасываем состояние ПОСЛЕ начала анимации
        this.currentShopUI = null;
        this.currentPlayerId = null;
        this.currentPlayerBalance = 0;
        this.purchasedWeaponTypes.clear();
        this.currentSlotElements.clear();
    }

    /**
     * Обновляет внешний вид и интерактивность всех слотов 
     * на основе текущего баланса и купленных предметов.
     */
    private updateSlotsAvailability(): void {
        if (!this.isShopOpen) return;

        this.currentSlotElements.forEach((elements, weaponType) => {
            const weaponData = elements.weaponData;
            const isPurchased = this.purchasedWeaponTypes.has(weaponType);
            const canAfford = weaponData.price <= this.currentPlayerBalance;

            // Обновляем видимость цены
            if (elements.priceText) {
                elements.priceText.setVisible(!isPurchased);
            }

            // Обновляем доступность и внешний вид иконки/фона
            const isAvailable = !isPurchased && canAfford;
            const alpha = isPurchased ? 0.6 : (canAfford ? 1 : 0.4); // Разная прозрачность
            const tint = isPurchased ? 0xaaaaaa : (canAfford ? 0xffffff : 0x888888); // Оттенки серого

            if (elements.icon) {
                elements.icon.setAlpha(alpha);
                elements.icon.setTint(tint);
                if (isAvailable) {
                    elements.icon.setInteractive(); // Включаем интерактивность
                } else {
                    elements.icon.disableInteractive(); // Выключаем интерактивность
                }
            }

            // Можно также менять фон, если нужно
            elements.background.setAlpha(alpha); 
            elements.background.setTint(tint);
            // Фону оставляем интерактивность для закрытия магазина
        });
    }

    /**
     * Уничтожение объекта
     */
    public destroy(): void {
        // Принудительно закрываем магазин и отписываемся от событий, если он был открыт
        if (this.isShopOpen) {
            this.closeShop(); 
        }
        if (this.interactionZone) this.interactionZone.destroy();
        if (this.interactionText) this.interactionText.destroy();

        super.destroy();
    }
}