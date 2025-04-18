import * as Phaser from 'phaser';
import { hexToNumber } from '../utils/colors';
import { createLogger } from '../../utils/logger';
import { COLORS } from '../core/Constants';
import { WeaponType } from '../weapons/WeaponTypes';
import { PlayerSetWeaponEventPayload } from '../core/types/playerTypes';
import { getWeaponConfig } from '../weapons';
import { WeaponOptions } from '../core/types/weaponTypes';

const logger = createLogger('WeaponStatus');

export class WeaponStatus {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Graphics;
    private weaponCircle!: Phaser.GameObjects.Graphics;
    private coinsText!: Phaser.GameObjects.Text;
    private ammoIcons: Phaser.GameObjects.Image[] = [];
    private weaponIcon!: Phaser.GameObjects.Image;

    private width: number = 380;
    private height: number = 58;
    private offsetY: number = 45;
    private offsetX: number = 60;
    private skewX: number = -0.2;
    private radius: number = 55;

    // Константы для внешнего вида
    private readonly BG_COLOR = hexToNumber(COLORS.INTERFACE_BLOCK_BACKGROUND);
    private readonly WEAPON_CIRCLE_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_BACKGROUND);
    private readonly TEXT_COLOR = COLORS.INTERFACE_BLOCK_TEXT;
    
    // Данные (хардкод для начала)
    private coins: number = 0;
    private maxAmmo: number = 12;
    private currentAmmo: number = 12;
    private currentWeapon: WeaponType | null = null;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.create();
        logger.info('Создан интерфейс отображения состояния оружия');
    }
    
    private create(): void {
        // Создаем контейнер для всех элементов
        this.container = this.scene.add.container(
            this.scene.cameras.main.width - this.width / 2 - this.offsetX,
            this.height / 2 + this.offsetY
        );
        this.container.setDepth(1000);

        // Создаем элементы UI с помощью отдельных методов
        this.createBackground();
        this.createWeaponCircle();
        this.createCoinsText();
        this.createAmmoIcons();
        this.createWeaponIcon();

        // Устанавливаем правильный порядок слоев в контейнере
        this.container.add([ 
            this.background, 
            this.weaponCircle, 
            this.weaponIcon,
            this.coinsText, 
        ]);
        // Переносим иконки патронов наверх, если они уже созданы
        this.ammoIcons.forEach(icon => this.container.bringToTop(icon));
    }
    
    private createBackground(): void {
        this.background = this.scene.add.graphics();
        this.drawBackground();
    }
    
    private createWeaponCircle(): void {
        this.weaponCircle = this.scene.add.graphics();
        this.drawWeaponCircle();
    }

    private createCoinsText(): void {
        this.coinsText = this.scene.add.text(-this.width / 2 + 40, 0, this.coins.toString(), {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: this.TEXT_COLOR.toString(),
            fontStyle: 'bold'
        });
        this.coinsText.setOrigin(0, 0.5);
    }

    private createWeaponIcon(): void {
        this.weaponIcon = this.scene.add.image(0, 0, ' ');
        this.weaponIcon.setVisible(false);
        this.weaponIcon.setOrigin(0.5);
        this.weaponIcon.setDepth(1);
    }

    private drawBackground(): void {
        this.background.clear();
        this.background.fillStyle(this.BG_COLOR, 1);
        
        // Рисуем скошенный прямоугольник с наклонами в другие стороны
        const skewLeft = this.height * this.skewX; // Левая сторона скошена ВПРАВО (отрицательное значение)
        const skewRight = this.height * this.skewX * -1; // Правая сторона скошена ВЛЕВО (положительное значение)
        const width = this.width;
        const height = this.height;
        
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
        this.weaponCircle.fillCircle(0, 0, this.radius);
    }
    
    private createAmmoIcons(): void {
        this.ammoIcons.forEach(icon => icon.destroy());
        this.ammoIcons = [];
        
        const startX = 70;
        const padding = 15;
        const maxPerRow = 6;
        
        for (let i = 0; i < this.maxAmmo; i++) {
            const row = Math.floor(i / maxPerRow);
            const col = i % maxPerRow;
            
            const ammoIcon = this.scene.add.rectangle(
                startX + col * padding, 
                -15 + row * 20,
                10, 
                20, 
                hexToNumber('#ffd700')
            );
            
            ammoIcon.setAlpha(i < this.currentAmmo ? 1 : 0.3);
            
            this.container.add(ammoIcon);
            this.ammoIcons.push(ammoIcon as unknown as Phaser.GameObjects.Image);
        }
    }
    
    private updateAmmoIcons(): void {
        for (let i = 0; i < this.ammoIcons.length; i++) {
            this.ammoIcons[i].setAlpha(i < this.currentAmmo ? 1 : 0.3);
        }
    }
    
    public setWeapon(payload: PlayerSetWeaponEventPayload): void {
        logger.info(`Вызван setWeapon с payload: ${JSON.stringify(payload)}`);
        this.currentWeapon = payload.weaponType;
        this.currentAmmo = payload.ammo;
        this.maxAmmo = payload.maxAmmo;

        const config = getWeaponConfig(this.currentWeapon);
        logger.info(`Получен конфиг для оружия ${this.currentWeapon}: ${JSON.stringify(config)}`);
        if (!config || !this.weaponIcon) {
            logger.error(`Конфиг для оружия ${this.currentWeapon} не найден!`);
            this.weaponIcon?.setVisible(false);
            return;
        }

        logger.info(`Установка текстуры: ${config.texture.key}`);
        this.weaponIcon.setTexture(config.texture.key);
        this.weaponIcon.setVisible(true);

        const iconScale = (this.radius * 2 * 0.7) / Math.max(this.weaponIcon.width, this.weaponIcon.height);
        logger.info(`Установка масштаба иконки: ${iconScale}`);
        this.weaponIcon.setScale(iconScale);
        
        this.createAmmoIcons();
        this.coinsText.setText(this.coins.toString());
    }
    
    public setAmmo(current: number, max: number): void {
        // logger.info(`Вызван setAmmo: current=${current}, max=${max}`);
        this.currentAmmo = current;
        this.maxAmmo = max;
        this.updateAmmoIcons();
    }
    
    public setCoins(coins: number): void {
        this.coins = coins;
        this.coinsText.setText(this.coins.toString());
    }
    
    public destroy(): void {
        this.container.destroy();
    }
} 