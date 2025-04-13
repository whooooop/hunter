import * as Phaser from 'phaser';
import { hexToNumber } from '../utils/colors';
import { createLogger } from '../../utils/logger';
import { COLORS } from '../core/Constants';
import { WeaponEntity } from '../core/entities/WeaponEntity';

const logger = createLogger('WeaponStatus');

export class WeaponStatus {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Graphics;
    private weaponCircle!: Phaser.GameObjects.Graphics;
    private coinsText!: Phaser.GameObjects.Text;
    private ammoIcons: Phaser.GameObjects.Image[] = [];
    
    // Константы для внешнего вида
    private readonly BG_COLOR = hexToNumber(COLORS.INTERFACE_BLOCK_BACKGROUND);
    private readonly WEAPON_CIRCLE_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_BACKGROUND);
    private readonly TEXT_COLOR = COLORS.INTERFACE_BLOCK_TEXT;
    private readonly PANEL_WIDTH = 350; // Увеличенная ширина блока
    private readonly PANEL_HEIGHT = 60; // Увеличенная высота блока
    private readonly CIRCLE_RADIUS = 45; // Ещё больший радиус круга
    
    // Данные (хардкод для начала)
    private coins: number = 9999;
    private maxAmmo: number = 12;
    private currentAmmo: number = 12;
    private currentWeapon: WeaponEntity | null = null;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.create();
        this.update();
        logger.info('Создан интерфейс отображения состояния оружия');
    }
    
    private create(): void {
        // Создаем контейнер для всех элементов
        this.container = this.scene.add.container(
            this.scene.cameras.main.width - this.PANEL_WIDTH / 2 - 20,
            this.PANEL_HEIGHT / 2 + 10
        );
        
        // Создаем круг для отображения текущего оружия
        this.weaponCircle = this.scene.add.graphics();
        this.drawWeaponCircle();
        
        // Создаем фоновую графику со скошенными углами
        this.background = this.scene.add.graphics();
        this.drawBackground();
        
        // Создаем текст для отображения количества монет
        this.coinsText = this.scene.add.text(-this.PANEL_WIDTH / 2 + 40, 0, this.coins.toString(), {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: this.TEXT_COLOR.toString(),
            fontStyle: 'bold'
        });
        this.coinsText.setOrigin(0, 0.5);
        
        // Устанавливаем правильный порядок элементов в контейнере
        // Фон должен быть под кругом оружия, а круг должен быть под текстом и иконками патронов
        this.container.add([this.background, this.weaponCircle, this.coinsText]);
        
        // Устанавливаем глубину отображения (поверх всего)
        this.container.setDepth(1000);
        
        // Создаем иконки патронов
        this.createAmmoIcons();
    }
    
    private drawBackground(): void {
        this.background.clear();
        this.background.fillStyle(this.BG_COLOR, 1);
        
        // Рисуем скошенный прямоугольник с наклонами в другие стороны
        const skewLeft = -15; // Левая сторона скошена ВПРАВО (отрицательное значение)
        const skewRight = 15; // Правая сторона скошена ВЛЕВО (положительное значение)
        const width = this.PANEL_WIDTH;
        const height = this.PANEL_HEIGHT;
        
        this.background.beginPath();
        // Верхняя линия
        this.background.moveTo(-width / 2 + skewLeft, -height / 2);
        this.background.lineTo(width / 2 + skewRight, -height / 2);
        // Правая линия
        this.background.lineTo(width / 2 - skewRight, height / 2);
        // Нижняя линия
        this.background.lineTo(-width / 2 - skewLeft, height / 2);
        this.background.closePath();
        this.background.fill();
    }
    
    private drawWeaponCircle(): void {
        this.weaponCircle.clear();
        this.weaponCircle.fillStyle(this.WEAPON_CIRCLE_COLOR, 1);
        this.weaponCircle.fillCircle(0, 0, this.CIRCLE_RADIUS);
    }
    
    private createAmmoIcons(): void {
        // Удаляем существующие иконки
        this.ammoIcons.forEach(icon => {
            icon.destroy();
            this.container.remove(icon);
        });
        this.ammoIcons = [];
        
        // Создаем новые иконки патронов
        const startX = 70; // Увеличенное смещение от центра из-за большего круга
        const padding = 15; // Расстояние между патронами
        const maxPerRow = 6; // Максимальное количество патронов в ряду
        
        for (let i = 0; i < this.maxAmmo; i++) {
            const row = Math.floor(i / maxPerRow);
            const col = i % maxPerRow;
            
            // Создаем иконку патрона как маленький золотистый прямоугольник
            const ammoIcon = this.scene.add.rectangle(
                startX + col * padding, 
                -15 + row * 20, // Увеличенное смещение рядов для лучшего размещения
                10, 
                20, 
                hexToNumber('#ffd700') // Золотистый цвет
            );
            
            // Если патрон "использован", делаем его полупрозрачным
            if (i >= this.currentAmmo) {
                ammoIcon.setAlpha(0.3);
            }
            
            this.ammoIcons.push(ammoIcon as unknown as Phaser.GameObjects.Image);
            this.container.add(ammoIcon);
        }
    }
    
    public update(): void {
        // Обновляем текст монет
        this.coinsText.setText(this.coins.toString());
        
        // Обновляем иконки патронов в зависимости от текущего боезапаса
        this.updateAmmoIcons();
    }
    
    private updateAmmoIcons(): void {
        // Обновляем прозрачность иконок патронов
        for (let i = 0; i < this.ammoIcons.length; i++) {
            if (i < this.currentAmmo) {
                this.ammoIcons[i].setAlpha(1);
            } else {
                this.ammoIcons[i].setAlpha(0.3);
            }
        }
    }
    
    /**
     * Устанавливает текущее оружие и обновляет интерфейс
     */
    public setWeapon(weapon: WeaponEntity | null): void {
        this.currentWeapon = weapon;
        this.currentAmmo = weapon?.getCurrentAmmo() || 0;
        this.maxAmmo = 12; // Хардкод для примера
        this.createAmmoIcons(); // Пересоздаем иконки патронов
        this.update();
    }
    
    /**
     * Обновляет количество патронов
     */
    public setAmmo(current: number, max: number): void {
        this.currentAmmo = current;
        this.maxAmmo = max;
        this.createAmmoIcons(); // Пересоздаем иконки патронов
        this.update();
    }
    
    /**
     * Устанавливает количество монет
     */
    public setCoins(coins: number): void {
        this.coins = coins;
        this.update();
    }
    
    /**
     * Уничтожает все ресурсы
     */
    public destroy(): void {
        this.container.destroy();
    }
} 