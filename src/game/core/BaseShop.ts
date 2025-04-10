import { createLogger } from "../../utils/logger";
import { Player } from "../entities/Player";
import { GameplayScene } from "../scenes/GameplayScene";
import { settings } from "../settings";

const logger = createLogger('Shop');

interface ShopOptions {
    texture: string;
    scale: number;
    interactionRadius: number; // Радиус взаимодействия
    debug: boolean;
    depthOffset: number;
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
        this.setDepth(y + settings.gameplay.depthOffset + options.depthOffset);
        
        // Создаем зону взаимодействия
        this.createInteractionZone();
        
        // Создаем иконку взаимодействия (пока скрыта)
        this.createInteractionIcon();
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
        super.update(time, delta);

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
        
        // Здесь можно добавить логику открытия UI магазина
        // Например, создать панель с товарами
        
        // Временное решение - просто выводим текст
        const shopText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            'МАГАЗИН ОРУЖИЯ\n\nНажмите E, чтобы закрыть',
            {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: {
                    x: 20,
                    y: 20
                }
            }
        );
        shopText.setOrigin(0.5);
        shopText.setDepth(1000);
        shopText.setScrollFactor(0); // Фиксирует текст на экране
        
        // Сохраняем ссылку на текст, чтобы удалить его при закрытии
        this.scene.registry.set('shopText', shopText);
    }
    
    /**
     * Закрывает интерфейс магазина
     */
    private closeShop(): void {
        this.isShopOpen = false;
        // Удаляем UI магазина
        const shopText = this.scene.registry.get('shopText');
        if (shopText) {
            shopText.destroy();
            this.scene.registry.remove('shopText');
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