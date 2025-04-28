import * as Phaser from 'phaser';
import { hexToNumber } from '../utils/colors';
import { createLogger } from '../../utils/logger';
import { COLORS } from '../core/Constants';
import { WeaponType } from '../weapons/WeaponTypes';
import { Player } from '../core/types/playerTypes';
import { getWeaponConfig } from '../weapons';
import { settings } from '../settings';
import { onEvent } from '../core/Events';

const logger = createLogger('WeaponStatus');

export class WeaponStatus {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Graphics;
    private weaponCircle!: Phaser.GameObjects.Graphics;
    private coinsText!: Phaser.GameObjects.Text;
    private ammoIcons: Phaser.GameObjects.Graphics[] = [];
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
    private readonly AMMO_COLOR = hexToNumber('#ffd700');
    private readonly AMMO_COLOR_INACTIVE = hexToNumber('#ffd700'); // Оставляем тот же цвет, но с альфой
    
    // Данные
    private coins: number = 0;
    private maxAmmo: number = 0; // Инициализируем нулем
    private currentAmmo: number = 0; // Инициализируем нулем
    private currentWeapon: WeaponType | null = null;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.create();
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
        this.createWeaponIcon();

        // Устанавливаем правильный порядок слоев в контейнере
        this.container.add([ 
            this.background, 
            this.weaponCircle, 
            this.weaponIcon,
            this.coinsText, 
        ]);

        onEvent(this.scene, Player.Events.SetWeapon.Local, this.setWeapon, this);
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
            fontFamily: settings.fontFamily,
            fontSize: '24px',
            color: this.TEXT_COLOR.toString(),
            fontStyle: 'bold'
        });
        this.coinsText.setOrigin(0, 0.5);
    }

    private createWeaponIcon(): void {
        this.weaponIcon = this.scene.add.image(0, 0, '__DEFAULT'); 
        this.weaponIcon.setVisible(false);
        this.weaponIcon.setOrigin(0.5);
        this.weaponIcon.setDepth(1);
    }

    private drawBackground(): void {
        this.background.clear();
        this.background.fillStyle(this.BG_COLOR, 1);
        
        const skewLeft = this.height * this.skewX;
        const skewRight = this.height * this.skewX * -1;
        const width = this.width;
        const height = this.height;
        
        this.background.beginPath();
        this.background.moveTo(-width / 2 + skewLeft, -height / 2);
        this.background.lineTo(width / 2 + skewRight, -height / 2);
        this.background.lineTo(width / 2 - skewRight, height / 2);
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

        if (this.maxAmmo <= 0) return; // Нечего рисовать

        // Параметры
        const baseIconWidth = 10;
        const baseIconHeight = 18; // Чуть меньше по высоте
        const basePaddingX = 5; 
        const basePaddingY = 3; // Добавили вертикальный отступ

        // Доступное пространство
        const startX = 70; // Начальная позиция X для иконок
        const marginX = 18; // Отступ справа
        const marginY = 1;  // Отступ сверху/снизу
        const availableWidth = (this.width / 2 - startX - marginX);
        const availableHeight = (this.height - 2 * marginY);
        const initialStartY = -this.height / 2 + marginY; // Базовая начальная Y до центрирования

        if (availableWidth <= 0 || availableHeight <= 0) {
            return;
        }

        // Расчет масштаба для вмещения всех иконок
        // Сначала грубо оценим компоновку (близко к квадрату)
        const approxIconsPerRow = Math.ceil(Math.sqrt(this.maxAmmo));
        const approxNumRows = Math.ceil(this.maxAmmo / approxIconsPerRow);
        const estimatedWidth = approxIconsPerRow * baseIconWidth + Math.max(0, approxIconsPerRow - 1) * basePaddingX;
        const estimatedHeight = approxNumRows * baseIconHeight + Math.max(0, approxNumRows - 1) * basePaddingY;

        let scale = 1;
        // Рассчитываем масштаб на основе оценки и доступного пространства
        const widthScale = estimatedWidth > availableWidth ? availableWidth / estimatedWidth : 1;
        const heightScale = estimatedHeight > availableHeight ? availableHeight / estimatedHeight : 1;
        scale = Math.min(widthScale, heightScale, 1); // Масштаб не должен быть больше 1

        // Применяем масштаб
        const scaledIconWidth = baseIconWidth * scale;
        const scaledIconHeight = baseIconHeight * scale;
        const scaledPaddingX = basePaddingX * scale;
        const scaledPaddingY = basePaddingY * scale;

        // Поиск наилучшей компоновки (numRows, iconsPerRow)
        let validLayouts = [];
        for (let numRows = 1; numRows <= this.maxAmmo; numRows++) {
            const requiredIconsPerRow = Math.ceil(this.maxAmmo / numRows);
            const currentWidth = requiredIconsPerRow * scaledIconWidth + Math.max(0, requiredIconsPerRow - 1) * scaledPaddingX;
            const currentHeight = numRows * scaledIconHeight + Math.max(0, numRows - 1) * scaledPaddingY;

            // Проверяем, влезает ли компоновка
            if (currentWidth <= availableWidth && currentHeight <= availableHeight) {
                // Расчет кол-ва иконок в последнем ряду (для оценки равномерности)
                const lastRowSize = this.maxAmmo - (numRows - 1) * requiredIconsPerRow;
                validLayouts.push({ rows: numRows, cols: requiredIconsPerRow, lastRow: lastRowSize });
            }

            // Оптимизация: если текущая высота уже не влезает, то и бОльшее кол-во рядов не влезет
            if (currentHeight > availableHeight && numRows > 1) {
                break;
            }
        }

        let bestLayout = null;
        if (validLayouts.length > 0) {
            // Сортировка: сначала самые полные последние ряды, потом меньше рядов
            validLayouts.sort((a, b) => {
                if (b.lastRow !== a.lastRow) {
                    return b.lastRow - a.lastRow; // Приоритет равномерности
                }
                return a.rows - b.rows; // Меньше рядов при равной равномерности
            });
            bestLayout = validLayouts[0];
        } else {
            // Запасной вариант, если ничего не подошло (маловероятно)
            const fallbackCols = Math.max(1, Math.floor((availableWidth + scaledPaddingX) / (scaledIconWidth + scaledPaddingX)));
            const fallbackRows = Math.ceil(this.maxAmmo / fallbackCols);
            bestLayout = { 
                rows: fallbackRows, 
                cols: fallbackCols, 
                lastRow: this.maxAmmo - (fallbackRows - 1) * fallbackCols 
            };
            // Убедимся, что lastRow не отрицательный в fallback
            if (bestLayout.lastRow <= 0) bestLayout.lastRow = fallbackCols; 
        }

        const iconsPerRow = bestLayout.cols;
        const numRows = bestLayout.rows;

        // Центрирование всего блока иконок по вертикали
        const totalHeight = numRows * scaledIconHeight + Math.max(0, numRows - 1) * scaledPaddingY;
        const verticalOffset = (availableHeight - totalHeight) / 2;
        const adjustedStartY = initialStartY + verticalOffset;

        // Создание и позиционирование иконок
        let iconCounter = 0;
        for (let r = 0; r < numRows; r++) {
            // Определяем количество иконок в текущем ряду
            const iconsInThisRow = (r === numRows - 1 && bestLayout.lastRow > 0) ? bestLayout.lastRow : iconsPerRow;

            // Горизонтальное центрирование иконок внутри ряда
            const rowWidth = iconsInThisRow * scaledIconWidth + Math.max(0, iconsInThisRow - 1) * scaledPaddingX;
            const horizontalOffset = (availableWidth - rowWidth) / 2;

            for (let c = 0; c < iconsInThisRow; c++) {
                if (iconCounter >= this.maxAmmo) break; // Дополнительная проверка

                const iconX = startX + horizontalOffset + c * (scaledIconWidth + scaledPaddingX);
                const iconY = adjustedStartY + r * (scaledIconHeight + scaledPaddingY);

                const ammoIcon = this.scene.add.graphics();
                // Используем iconCounter для определения альфы
                ammoIcon.fillStyle(this.AMMO_COLOR, iconCounter < this.currentAmmo ? 1 : 0.3);
                ammoIcon.fillRect(0, 0, scaledIconWidth, scaledIconHeight);
                ammoIcon.setPosition(iconX, iconY);

                this.container.add(ammoIcon);
                this.ammoIcons.push(ammoIcon);
                iconCounter++;
            }
            if (iconCounter >= this.maxAmmo) break; // Выход из внешнего цикла
        }
    }
    
    private updateAmmoIcons(): void {
        for (let i = 0; i < this.ammoIcons.length; i++) {
            if (i < this.maxAmmo) {
                this.ammoIcons[i].setAlpha(i < this.currentAmmo ? 1 : 0.3);
            }
        }
    }
    
    public setWeapon(payload: Player.Events.SetWeapon.Payload): void {
        this.currentWeapon = payload.weaponType as WeaponType;
        const config = getWeaponConfig(this.currentWeapon);
        if (!config || !this.weaponIcon) {
            this.weaponIcon?.setVisible(false);
            this.ammoIcons.forEach(icon => icon.destroy());
            this.ammoIcons = [];
            return;
        }

        try {
            this.weaponIcon.setTexture(config.texture.key);
            this.weaponIcon.setVisible(true);

            const iconScale = (this.radius * 2 * 0.4) / Math.max(this.weaponIcon.height || 1);
            this.weaponIcon.setScale(iconScale);
        } catch (error) {
            this.weaponIcon.setVisible(false);
        }
        
        this.createAmmoIcons(); 
        this.coinsText.setText(this.coins.toString());
    }
    
    public setAmmo(current: number, max: number): void {
        if (this.currentAmmo === current && this.maxAmmo === max) {
            return;
        }

        const maxAmmoChanged = this.maxAmmo !== max;
        this.currentAmmo = current;
        this.maxAmmo = max;

        if (maxAmmoChanged) {
            this.createAmmoIcons();
        } else {
            this.updateAmmoIcons();
        }
    }
    
    public setCoins(coins: number): void {
        this.coins = coins;
        this.coinsText.setText(this.coins.toString());
    }
    
    public destroy(): void {
        this.container.destroy();
    }
} 