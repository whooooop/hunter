import { COLORS } from '../Constants';
import { emitEvent } from '../GameEvents';
import { FONT_FAMILY, OBJECTS_DEPTH_OFFSET } from '../config';
import { hexToNumber } from '../utils/colors';
import { getWeaponConfig } from '../weapons';
import { WeaponType } from '../weapons/WeaponTypes';

import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin';
import { Game, ScoreEvents, ShopEvents, ShopSlotElement, ShopWeapon, Weapon } from '../types';

// --- Константы --- 
const INTERACTIVE_BLOCK_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_BACKGROUND);
const INTERACTIVE_BLOCK_BORDER_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_BORDER);
const INTERACTIVE_BUTTON_TEXT_COLOR = hexToNumber(COLORS.INTERACTIVE_BUTTON_TEXT);
const INNER_CIRCLE_GRADIENT_COLOR = hexToNumber('#e6892e'); // Внутренняя тень круга
const PURCHASED_ITEM_ALPHA = 0.6;
const UNAFFORDABLE_ITEM_ALPHA = 0.4;
const AVAILABLE_ITEM_ALPHA = 1.0;
const PURCHASED_ITEM_TINT = 0xaaaaaa;
const DEFAULT_ITEM_TINT = 0xffffff;

// Настройки для кругов магазина по умолчанию (можно переопределить при вызове)
const DEFAULT_SLOT_SIZE = 126;
const DEFAULT_GRADIENT_SIZE = 50;
const DEFAULT_GRADIENT_ALPHA_START = 0.5;

interface CircleConfig {
  assignedWeapons: ShopWeapon[];
  circleRadius: number;
  slotCount: number;
  slotSize?: number;
  marginFromEdge?: number;
  startAngle: number;
  angleMargin: number;
  gradientSize?: number;
  gradientAlphaStart?: number;
  gradientColor?: number;
  centerOffset?: { x: number; y: number };
  zIndexBase: number;
  position: { x: number; y: number };
}

interface ShopOptions {
  texture: string;
  scale: number;
  interactionRadius: number; // Радиус взаимодействия
  debug: boolean;
  depthOffset?: number;
}

export class ShopEntity extends Phaser.GameObjects.Sprite {
  protected options: ShopOptions;
  protected interactionZone!: Phaser.GameObjects.Zone;
  protected interactionIcon!: Phaser.GameObjects.Sprite;
  protected interactionText!: Phaser.GameObjects.Text;

  // Храним ID ближайшего игрока, а не просто флаг
  protected nearbyPlayerId: string | null = null;
  protected isShopOpen: boolean = false;
  protected weapons: ShopWeapon[] = [];

  protected isAnimating: boolean = false;

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
    this.setDepth(y + this.height / 2 * this.scale + OBJECTS_DEPTH_OFFSET + (this.options.depthOffset || 0));

    // Создаем зону взаимодействия
    this.createInteractionZone();
  }

  static preload(scene: Phaser.Scene): void { }

  public getIsShopOpen(): boolean {
    return this.isShopOpen;
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

  public setNearbyPlayer(isNearby: boolean): void {
    if (isNearby) {
    } else {
      if (this.isShopOpen) {
        this.closeShop();
      }
    }
  }

  public getInteractionRadius(): number {
    return this.options.interactionRadius;
  }

  /**
   * Открывает интерфейс магазина для конкретного игрока
   * @param playerId ID игрока
   */
  public openShop(playerId: string, playerBalance: number, playerPurchasedWeapons: Set<WeaponType>, weapons: ShopWeapon[]): void {
    if (this.isShopOpen || this.isAnimating) return; // Не открывать, если уже открыт

    this.isShopOpen = true;
    this.isAnimating = true;
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
    const innerCircle = this.drawCircleWithSlots({
      circleRadius: 520 / 2,          // Радиус 260px
      slotCount: innerMaxSlots,        // Макс слотов
      assignedWeapons: weaponsForInner,// Передаем оружие
      slotSize: 126,                  // Размер слота 126px
      marginFromEdge: 10,             // Отступ от края круга
      startAngle: Math.PI / 1.9,      // Начальный угол
      angleMargin: Math.PI / 1.5,     // Угловой отступ
      gradientSize: 50,               // Размер градиента
      gradientAlphaStart: 0.5,        // Начальная прозрачность градиента
      gradientColor: INNER_CIRCLE_GRADIENT_COLOR,
      centerOffset: { x: 100, y: 250 }, // Индивидуальное смещение для этого круга
      zIndexBase: 1000,               // Базовый Z-индекс
      position: { x: -260, y: -290 }   // Позиция круга
    });

    // Отрисовываем внешний круг с 6 слотами
    const outerCircle = this.drawCircleWithSlots({
      circleRadius: 810 / 2,          // Радиус 405px (больше первого)
      slotCount: outerMaxSlots,        // Макс слотов
      assignedWeapons: weaponsForOuter,// Передаем оружие
      slotSize: 126,                  // Размер слота такой же
      marginFromEdge: 10,             // Чуть больший отступ
      startAngle: Math.PI / 1.9,        // Начальный угол (вверх)
      angleMargin: Math.PI / 1.6,      // Меньший угловой отступ для большего распределения
      gradientSize: 100,               // Чуть больший градиент
      gradientAlphaStart: 0.4,        // Меньшая прозрачность для внешнего круга
      gradientColor: INNER_CIRCLE_GRADIENT_COLOR,
      centerOffset: { x: 0, y: 0 },   // Отдельное смещение центра
      zIndexBase: 900,                // Меньший Z-индекс чтобы был под первым кругом
      position: { x: -290, y: -170 }   // Своя позиция для внешнего круга
    });

    shopUI.add([innerCircle, outerCircle]);

    this.updateSlotsAvailability();
    this.animateShopOpen(shopUI, innerCircle, outerCircle);
  }

  /**
   * Создает круг с указанным количеством слотов внутри
   * @param container - контейнер для добавления графики
   * @param options - параметры отрисовки круга и слотов
   * @returns Контейнер круга для возможности анимаций
   */
  private drawCircleWithSlots(options: CircleConfig): Phaser.GameObjects.Container {
    const postFxPlugin = this.scene.plugins.get('rexOutlinePipeline') as OutlinePipelinePlugin;
    const circleContainer = this.scene.add.container(options.position.x, options.position.y);
    circleContainer.setDepth(options.zIndexBase);

    const slotSize = options.slotSize ?? DEFAULT_SLOT_SIZE;
    const slotRadius = slotSize / 2;
    const gradientSize = options.gradientSize ?? DEFAULT_GRADIENT_SIZE;
    const gradientAlphaStart = options.gradientAlphaStart ?? DEFAULT_GRADIENT_ALPHA_START;
    const gradientColor = options.gradientColor ?? INTERACTIVE_BLOCK_BORDER_COLOR;
    const marginFromEdge = options.marginFromEdge ?? 10;
    const centerOffsetX = options.centerOffset?.x ?? 0;
    const centerOffsetY = options.centerOffset?.y ?? 0;

    const circleGraphics = this.scene.add.graphics();
    const centerX = options.circleRadius + centerOffsetX;
    const centerY = options.circleRadius + centerOffsetY;

    // Градиентная тень круга
    for (let i = 0; i < gradientSize; i++) {
      const alpha = gradientAlphaStart - (i / gradientSize * gradientAlphaStart);
      const radius = options.circleRadius - i;
      if (radius <= 0) break;
      circleGraphics.lineStyle(1, gradientColor, alpha);
      circleGraphics.beginPath();
      circleGraphics.arc(centerX, centerY, radius, 0, Math.PI * 2);
      circleGraphics.strokePath();
    }

    // Добавляем круг в контейнер
    circleContainer.add(circleGraphics);

    // Радиус, на котором размещаем слоты
    const placementRadius = options.circleRadius - slotRadius - marginFromEdge;

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

      // Получаем данные об оружии для этого слота, если они есть
      const weaponData = options.assignedWeapons[i];

      // Рисуем круг-фон слота
      const slotBackground = this.scene.add.circle(x, y, slotRadius, INTERACTIVE_BLOCK_COLOR);

      if (weaponData) {
        const config: Weapon.Config | undefined = getWeaponConfig(weaponData.type);
        // Рисуем иконку оружия
        const weaponIcon = this.scene.add.sprite(x, y - 10, config.texture.key);
        const iconScale = (slotSize * 0.36) / (weaponIcon.height || 1);
        weaponIcon.setScale(iconScale);

        postFxPlugin.add(weaponIcon, {
          thickness: 3,
          outlineColor: 0xFFFFFF
        });

        weaponIcon.setRotation(-0.1);

        // Рисуем цену под иконкой
        const priceText = this.scene.add.text(x, y + slotRadius * 0.7, weaponData.price.toString(), {
          fontFamily: FONT_FAMILY.REGULAR,
          fontSize: `${Math.round(slotSize * 0.22)}px`,
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
        slotBackground.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          console.log('pointerdown', weaponData.type);
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
        // Если оружия для этого слота нет, делаем фон невидимым
        slotBackground.setVisible(false);
        // Не сохраняем в currentSlotElements, так как тут нет оружия
        circleContainer.add(slotBackground);
      }
    }

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

    emitEvent(this.scene, Game.Events.Stat.Local, {
      event: Game.Events.Stat.PurchaseWeaponEvent.Event,
      data: {
        weaponName: weaponType,
      },
    });

    this.updateSlotsAvailability();
  }

  /**
   * Закрывает интерфейс магазина
   */
  public closeShop(): void {
    if (!this.isShopOpen || this.isAnimating) return;

    this.isShopOpen = false;
    this.isAnimating = true;
    const shopUIToClose = this.currentShopUI; // Сохраняем ссылку для анимации

    if (shopUIToClose) {
      // Анимация исчезновения UI
      this.animateShopClose(shopUIToClose);
    }
  }

  private animateShopClose(shopUI: Phaser.GameObjects.Container): void {
    const animationDuration = 200;
    const destroyDelay = 250; // Задержка перед уничтожением (чуть больше duration)

    // Анимация исчезновения основного контейнера
    this.scene.tweens.add({
      targets: shopUI,
      alpha: 0,
      duration: animationDuration,
      ease: 'Power2',
      onComplete: () => {
        // Откладываем уничтожение и сброс состояния
        this.isAnimating = false;
        this.scene.time.delayedCall(destroyDelay - animationDuration, () => {
          if (!shopUI.scene) return; // Проверка, что объект еще существует и принадлежит сцене
          shopUI.setVisible(false);
          shopUI.destroy();

          // Сбрасываем состояние здесь
          this.currentShopUI = null;
          this.currentPlayerId = null;
          this.currentPlayerBalance = 0;
          this.currentSlotElements.clear();
        });
      }
    });

    // Возвращаем анимацию для дочерних контейнеров
    shopUI.getAll().forEach((gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject instanceof Phaser.GameObjects.Container) {
        this.scene.tweens.add({
          targets: gameObject,
          scale: 0.8,
          y: gameObject.y + 50,
          duration: animationDuration,
          ease: 'Back.in'
        });
      }
    });
  }

  /**
   * Обновляет внешний вид и интерактивность всех слотов 
   * на основе текущего баланса и купленных предметов.
   */
  private updateSlotsAvailability(): void {
    if (!this.isShopOpen) return;
    console.log('updateSlotsAvailability', this.isShopOpen);

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
      const iconAlpha = isPurchased ? PURCHASED_ITEM_ALPHA : (canAfford ? AVAILABLE_ITEM_ALPHA : UNAFFORDABLE_ITEM_ALPHA);
      const iconTint = isPurchased ? PURCHASED_ITEM_TINT : DEFAULT_ITEM_TINT;

      if (elements.icon) {
        elements.icon.setAlpha(iconAlpha);
        elements.icon.setTint(iconTint);
        if (isAvailable) {
          elements.background.setInteractive(); // Включаем интерактивность
        } else {
          elements.background.disableInteractive(); // Выключаем интерактивность
        }
      }

      elements.background.setAlpha(iconAlpha);
    });
  }

  // --- Анимации --- 

  // Возвращаем определение метода animateShopOpen
  private animateShopOpen(shopUI: Phaser.GameObjects.Container, innerCircle: Phaser.GameObjects.Container, outerCircle: Phaser.GameObjects.Container): void {
    shopUI.setAlpha(0);
    this.scene.tweens.add({
      targets: shopUI,
      alpha: 1,
      duration: 200,
      ease: 'Back.out'
    });

    innerCircle.setScale(0.8);
    this.scene.tweens.add({
      targets: innerCircle,
      scale: 1,
      duration: 200,
      ease: 'Back.out',
    });

    outerCircle.setScale(0.8);
    this.scene.tweens.add({
      targets: outerCircle,
      scale: 1,
      duration: 200,
      ease: 'Back.out',
      delay: 20,
      onComplete: () => {
        this.isAnimating = false;
      }
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
  }
}