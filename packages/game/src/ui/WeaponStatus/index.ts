import { SyncCollectionRecord } from '@hunter/multiplayer/dist/Collection';
import { StorageSpace } from '@hunter/multiplayer/dist/StorageSpace';
import { PlayerScoreState, PlayerWeapon, WeaponState } from '@hunter/storage-proto/dist/storage';
import * as Phaser from 'phaser';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin';
import { DISPLAY, FONT_FAMILY } from '../../config';
import { COLORS } from '../../Constants';
import { emitEvent, offEvent, onEvent } from '../../GameEvents';
import { playerScoreStateCollection } from '../../storage/collections/playerScoreState.collection';
import { playerWeaponCollection } from '../../storage/collections/playerWeapon.collection';
import { weaponStateCollection } from '../../storage/collections/weaponState.collection';
import { BulletTexture, preloadBulletTextures } from '../../textures/bullet';
import { CoinsTexture, preloadCoinsTextures } from '../../textures/coins';
import { Controls, Weapon } from '../../types';
import { hexToNumber } from '../../utils/colors';
import { createLogger } from '../../utils/logger';
import { getWeaponConfig } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { reloadText } from './translates';

const logger = createLogger('WeaponStatus');

export class WeaponStatus {
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Graphics;
  private weaponCircle!: Phaser.GameObjects.Graphics;
  private coinsText!: Phaser.GameObjects.Text;
  private coinsIcon!: Phaser.GameObjects.Image;
  private ammoIcons: Phaser.GameObjects.Sprite[] = [];
  private weaponIcon!: Phaser.GameObjects.Image;
  private reloadOverlay!: Phaser.GameObjects.Graphics;
  private reloadText!: Phaser.GameObjects.Text;
  private reloadContainer!: Phaser.GameObjects.Container;
  private reloadProgressRing!: Phaser.GameObjects.Graphics;
  private isReloadOverlayVisible: boolean = false;
  private reloadProgress: number = 0; // Прогресс перезарядки от 0 до 1

  private width: number = 380;
  private height: number = 58;
  private offsetY: number = 45;
  private offsetX: number = 160;
  private skewX: number = -0.2;
  private radius: number = 55;

  // Константы для внешнего вида
  private readonly BG_COLOR = hexToNumber(COLORS.INTERFACE_BLOCK_BACKGROUND);
  private readonly WEAPON_CIRCLE_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_BACKGROUND);
  private readonly TEXT_COLOR = COLORS.INTERFACE_BLOCK_TEXT;

  // Данные
  private coins: number = 0;
  private maxAmmo: number = 0; // Инициализируем нулем
  private currentAmmo: number = 0; // Инициализируем нулем
  private currentWeapon: WeaponType | null = null;

  private readonly AMMO_ICON_ALPHA_ACTIVE = 0.8;
  private readonly AMMO_ICON_ALPHA_INACTIVE = 0.3;

  private readonly OVERLAY_ALPHA = 0.8;

  static preload(scene: Phaser.Scene): void {
    preloadBulletTextures(scene);
    preloadCoinsTextures(scene);
  }

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly storage: StorageSpace,
    private readonly playerId: string
  ) {
    this.create();

    this.storage.on<PlayerScoreState>(playerScoreStateCollection, 'Add', this.updateCoins.bind(this));
    this.storage.on<PlayerScoreState>(playerScoreStateCollection, 'Update', this.updateCoins.bind(this));
    this.storage.on<PlayerWeapon>(playerWeaponCollection, 'Add', this.updateWeapon.bind(this));
    this.storage.on<PlayerWeapon>(playerWeaponCollection, 'Update', this.updateWeapon.bind(this));

    onEvent(this.scene, Weapon.Events.Reloading.Local, this.updateReloadProgress, this);
  }

  private create(): void {
    this.container = this.scene.add.container(
      DISPLAY.WIDTH - this.width / 2 - this.offsetX,
      this.height / 2 + this.offsetY
    );
    this.container.setDepth(1000);

    this.createBackground();
    this.createWeaponCircle();
    this.createCoinsText();
    this.createCoinsIcon();
    this.createWeaponIcon();
    this.createReloadOverlay();
    this.setupWeaponCircleInteractivity();

    this.container.add([
      this.background,
      this.weaponCircle,
      this.weaponIcon,
      this.reloadContainer,
      this.coinsIcon,
      this.coinsText,
    ]);
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
    this.coinsText = this.scene.add.text(-this.width / 2 + 50, 0, this.coins.toString(), {
      fontFamily: FONT_FAMILY.BOLD,
      fontSize: '24px',
      color: this.TEXT_COLOR.toString(),
      fontStyle: 'bold'
    });
    this.coinsText.setOrigin(0, 0.5);
  }

  private createCoinsIcon(): void {
    this.coinsIcon = this.scene.add.image(-this.width / 2 + 30, 0, CoinsTexture.key);
    this.coinsIcon.setVisible(true);
    this.coinsIcon.setOrigin(0.5);
    this.coinsIcon.setDepth(1);
    this.coinsIcon.setScale(CoinsTexture.scale * 0.8);
    this.coinsIcon.setAlpha(0.9);
  }

  private createWeaponIcon(): void {
    this.weaponIcon = this.scene.add.image(0, 0, '__DEFAULT');
    this.weaponIcon.setVisible(false);
    this.weaponIcon.setOrigin(0.5);
    this.weaponIcon.setDepth(1);
  }

  private createReloadOverlay(): void {
    // Создаем контейнер для reload overlay
    this.reloadContainer = this.scene.add.container(0, 0);

    // Черный круг с прозрачностью 0.6 поверх желтого круга
    this.reloadOverlay = this.scene.add.graphics();
    this.reloadOverlay.fillStyle(0x000000, this.OVERLAY_ALPHA);
    this.reloadOverlay.fillCircle(0, 0, this.radius);

    // Прогресс-обводка вокруг черного круга
    this.reloadProgressRing = this.scene.add.graphics();
    this.drawReloadProgress();

    // Текст RELOAD в центре круга
    this.reloadText = this.scene.add.text(0, 0, reloadText.translate.toUpperCase(), {
      fontFamily: FONT_FAMILY.BOLD,
      fontSize: '14px',
      color: '#FFFFFF'
    });
    this.reloadText.setOrigin(0.5);

    // Добавляем элементы в контейнер
    this.reloadContainer.add([this.reloadOverlay, this.reloadProgressRing, this.reloadText]);

    // По умолчанию скрыт
    this.reloadContainer.setVisible(false);
  }

  private updateReloadProgress(payload: Weapon.Events.Reloading.Payload): void {
    if (payload.playerId !== this.playerId) return;

    this.setReloadProgress(payload.progress);

    if (payload.progress !== 1) {
      this.showReloadOverlay();
    }
  }

  private setupWeaponCircleInteractivity(): void {
    // Создаем невидимую интерактивную область поверх желтого круга
    const hitArea = this.scene.add.circle(0, 0, this.radius, 0x000000, 0);
    hitArea.setInteractive();

    hitArea.on('pointerdown', () => {
      // Вызываем событие перезарядки
      emitEvent(this.scene, Controls.Events.Reload.Event, { playerId: this.playerId });
    });

    this.container.add(hitArea);
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

  private drawReloadProgress(): void {
    this.reloadProgressRing.clear();

    if (this.reloadProgress > 0) {
      // Радиус для обводки (на 2 пикселя больше основного круга)
      const progressRadius = this.radius - 1;

      // Рассчитываем угол для дуги (начинаем с верхней точки, -90 градусов)
      const startAngle = -Math.PI / 2; // -90 градусов в радианах (верхняя точка)
      const endAngle = startAngle + (this.reloadProgress * 2 * Math.PI); // Прогресс по окружности

      // Рисуем обводку прогресса
      this.reloadProgressRing.lineStyle(2, 0xFFFFFF, 1); // Белая обводка 2 пикселя
      this.reloadProgressRing.beginPath();
      this.reloadProgressRing.arc(0, 0, progressRadius, startAngle, endAngle, false);
      this.reloadProgressRing.strokePath();
    }
  }

  public setReloadProgress(progress: number): void {
    this.reloadProgress = Math.max(0, Math.min(1, progress));
    this.drawReloadProgress();

    if (progress === 1) {
      this.hideReloadOverlay();
    }
  }

  private createAmmoIcons(): void {
    this.ammoIcons.forEach(icon => icon.destroy());
    this.ammoIcons = [];

    if (this.maxAmmo <= 0) return; // Нечего рисовать

    // Параметры
    const baseIconWidth = 13;
    const baseIconHeight = 29;
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

        const ammoIcon = this.scene.add.sprite(iconX, iconY, BulletTexture.key);
        // Используем iconCounter для определения альфы
        ammoIcon.setAlpha(iconCounter < this.currentAmmo ? this.AMMO_ICON_ALPHA_ACTIVE : this.AMMO_ICON_ALPHA_INACTIVE);
        ammoIcon.setOrigin(0, 0); // Левый верхний угол как у прямоугольника

        // Рассчитываем масштаб с сохранением пропорций
        const scaleX = scaledIconWidth / ammoIcon.width;
        const scaleY = scaledIconHeight / ammoIcon.height;
        const scale = Math.min(scaleX, scaleY); // Берем меньший масштаб для сохранения пропорций
        ammoIcon.setScale(scale);

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
        this.ammoIcons[i].setAlpha(i < this.currentAmmo ? this.AMMO_ICON_ALPHA_ACTIVE : this.AMMO_ICON_ALPHA_INACTIVE);
      }
    }
  }

  private updateWeapon(playerId: string, record: SyncCollectionRecord<PlayerWeapon>): void {
    if (playerId !== this.playerId) return;
    const weaponState = this.storage.getCollection<WeaponState>(weaponStateCollection)!.getItem(record.data.weaponId);

    if (!weaponState) return;
    this.currentWeapon = weaponState.type as WeaponType;
    const currentWeaponConfig = getWeaponConfig(this.currentWeapon);

    if (!currentWeaponConfig || !this.weaponIcon) {
      this.weaponIcon?.setVisible(false);
      this.ammoIcons.forEach(icon => icon.destroy());
      this.ammoIcons = [];
      return;
    }

    try {
      const postFxPlugin = this.scene.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
      this.weaponIcon.setTexture(currentWeaponConfig.texture.key);
      this.weaponIcon.setVisible(true);
      postFxPlugin.remove(this.weaponIcon);
      postFxPlugin.add(this.weaponIcon, {
        thickness: 3,
        outlineColor: 0xFFFFFF
      });
      const iconScale = (this.radius * 2 * 0.4) / Math.max(this.weaponIcon.height || 1);
      this.weaponIcon.setScale(iconScale).setRotation(-0.1);
    } catch (error) {
      console.error(error);
      this.weaponIcon.setVisible(false);
    }
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

    this.checkAmmoAndShowReload();
  }

  private updateCoins(playerId: string, record: SyncCollectionRecord<PlayerScoreState>): void {
    if (playerId === this.playerId) {
      this.coins = record.data.value;
      this.coinsText.setText(this.coins.toString());
    }
  }

  public showReloadOverlay(): void {
    this.reloadContainer.setVisible(true);
    this.isReloadOverlayVisible = true;
    this.startBlinkingAnimation();
    this.drawReloadProgress();
  }

  public hideReloadOverlay(): void {
    this.reloadContainer.setVisible(false);
    this.isReloadOverlayVisible = false;
    this.stopBlinkingAnimation();
    this.drawReloadProgress();
  }

  private checkAmmoAndShowReload(): void {
    if (this.currentAmmo === 0 && !this.isReloadOverlayVisible) {
      this.showReloadOverlay();
    }
  }

  private startBlinkingAnimation(): void {
    // Останавливаем предыдущие анимации
    this.scene.tweens.killTweensOf(this.reloadText);

    // Создаем мерцающую анимацию
    this.scene.tweens.add({
      targets: this.reloadText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1, // Бесконечное повторение
      ease: 'Sine.easeInOut'
    });
  }

  private stopBlinkingAnimation(): void {
    // Останавливаем анимацию мерцания
    this.scene.tweens.killTweensOf(this.reloadText);
    // Возвращаем нормальную прозрачность
    this.reloadText.setAlpha(1);
  }

  public destroy(): void {
    this.stopBlinkingAnimation();
    this.container.destroy();
    offEvent(this.scene, Weapon.Events.Reloading.Local, this.updateReloadProgress, this);
  }
} 