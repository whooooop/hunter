import * as Phaser from 'phaser';
import { emitEvent } from '../GameEvents';
import { Decals } from '../types/decals';
import { hexToNumber } from '../utils/colors';

const defaultOptions = {
  ejectionSpeed: 180,  // Скорость выброса гильз
  ejectionAngle: 1,    // Угол выброса гильз (в градусах) - увеличен для выброса вверх и назад
  gravity: 700,        // Гравитация для гильз
  bounce: 1,           // Коэффициент отскока
  scale: 0.35,         // Масштаб гильз
  dragX: 100,          // Трение по X для остановки гильз
}

/**
 * Класс представляющий гильзу оружия
 */
export class ShellCasingEntity extends Phaser.Physics.Arcade.Sprite {
  private floorLevel: number;
  private hasHitFloor: boolean = false;

  /**
   * Создает новую гильзу
   * @param scene Сцена, на которой будет размещена гильза
   * @param x Начальная позиция X
   * @param y Начальная позиция Y
   * @param direction Направление выстрела (1 вправо, -1 влево)
   */
  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    const offsetX = direction > 0 ? -15 : 15;
    const offsetY = -10;
    const shellX = x + offsetX;
    const shellY = y + offsetY;

    super(scene, shellX, shellY, 'shell_casing');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(defaultOptions.scale);
    this.setDepth(100);

    // Устанавливаем пол для гильзы немного ниже места появления
    // Y + 20 должно быть близко к ногам персонажа, не давая гильзе упасть слишком низко
    this.floorLevel = y + 20 + Phaser.Math.Between(-25, 25);

    // Применяем физические свойства
    this.applyPhysics(direction);

    this.scene.events.on('update', this.update, this);
  }

  /**
   * Применяет физические свойства к гильзе
   * @param direction Направление выстрела
   */
  private applyPhysics(direction: number): void {
    // Рассчитываем угол выброса гильзы (с небольшой случайностью)
    const ejectionAngle = Phaser.Math.DegToRad(
      defaultOptions.ejectionAngle + Phaser.Math.Between(-15, 15)
    );

    // Скорость выброса с небольшой случайностью
    const ejectionSpeed = defaultOptions.ejectionSpeed + Phaser.Math.Between(-20, 20);

    // Определяем базовый угол в зависимости от направления стрельбы
    // Если direction = 1 (вправо), гильза должна вылетать назад и вверх
    // Если direction = -1 (влево), гильза должна вылетать вперёд и вверх
    const baseAngle = direction > 0 ? Math.PI - ejectionAngle : ejectionAngle;

    // Применяем скорость к гильзе
    this.setVelocity(
      Math.cos(baseAngle) * ejectionSpeed,
      Math.sin(baseAngle) * ejectionSpeed
    );

    // Применяем небольшое начальное вращение
    this.setAngularVelocity(Phaser.Math.Between(-200, 200));

    // Устанавливаем свойства физики
    this.setDragX(defaultOptions.dragX);
    this.setBounce(defaultOptions.bounce);
    this.setGravityY(defaultOptions.gravity);
  }


  /**
   * Обновляет состояние гильзы (вызывается каждый кадр)
   */
  update(time: number, delta: number): void {
    if (!this.body) return;

    // Проверяем, достигла ли гильза своего уровня пола
    if (this.y >= this.floorLevel && !this.hasHitFloor) {
      this.onHitFloor();
    }
    // Проверяем, достигла ли гильза нижней границы мира
    else if (this.body.blocked.down && !this.hasHitFloor) {
      // Если гильза достигла нижней границы мира, она должна остановиться
      this.onHitFloor();
    }
    else if (this.hasHitFloor) {
      // Если гильза уже на полу, поддерживаем ее на правильной высоте
      if (this.floorLevel < this.scene.physics.world.bounds.height) {
        this.y = this.floorLevel;
        this.setVelocityY(0);
      }
    }
  }

  /**
   * Обрабатывает столкновение гильзы с полом
   */
  private onHitFloor(): void {
    this.hasHitFloor = true;

    // Полностью останавливаем вращение
    this.setAngularVelocity(0);

    // Фиксируем случайный угол для гильзы (чтобы они лежали по-разному)
    this.setAngle(Phaser.Math.Between(-20, 20));

    // Уменьшаем горизонтальную скорость
    const body = this.body;
    if (body) {
      this.setVelocityX(body.velocity.x * 0.3);
    }

    // Добавляем трение для быстрой остановки
    this.setDragX(defaultOptions.dragX * 2);

    // Гасим вертикальную скорость и устанавливаем позицию точно на уровне пола
    this.setVelocityY(0);
    this.y = this.floorLevel;

    // Устанавливаем задержку для проверки, остановилась ли гильза
    this.scene.time.delayedCall(500, () => {
      if (this.active && this.body) {
        // Если скорость гильзы близка к нулю, она лежит спокойно
        if (Math.abs(this.body.velocity.x) < 5) {
          emitEvent(this.scene, Decals.Events.Local, { object: this, x: this.x, y: this.y, type: 'shellCasing' });
          this.destroy();
        }
      }
    });
  }

  public destroy(): void {
    try {
      this.scene.events.off('update', this.update, this);
      super.destroy();
    } catch (error) {
      console.error(error);
    }
  }
}

/**
 * Скрипт для программного создания текстуры гильзы
 * Этот подход позволяет не зависеть от внешних файлов изображений
 */
export const createShellCasingTexture = (scene: Phaser.Scene): void => {
  // Проверяем, существует ли уже такая текстура
  if (scene.textures.exists('shell_casing')) {
    scene.textures.remove('shell_casing'); // Удаляем существующую текстуру для пересоздания
  }

  // Размер текстуры (увеличиваем для лучшей видимости)
  const width = 24;
  const height = 8;

  // Создаем новую графику для рисования гильзы
  const graphics = scene.add.graphics();

  // Цвета для гильзы - делаем более яркими
  const shellColor = hexToNumber('#FFD700');       // Основной цвет гильзы (ярко-желтый)
  const shellStrokeColor = hexToNumber('#FF8800'); // Контур гильзы (оранжевый для контраста)

  // Рисуем гильзу в виде яркой желтой палочки с оранжевым контуром
  graphics.fillStyle(shellColor, 1);
  graphics.lineStyle(1, shellStrokeColor, 1);

  // Рисуем прямоугольник для основной части гильзы
  graphics.fillRect(2, 1, 20, 6);
  graphics.strokeRect(2, 1, 20, 6);

  // Добавляем дополнительные элементы для лучшей видимости
  graphics.fillStyle(0xFF8800, 1); // Оранжевый для торца гильзы
  graphics.fillRect(2, 1, 3, 6);   // Торец гильзы

  // Создаем текстуру из графики
  graphics.generateTexture('shell_casing', width, height);

  // Удаляем графику после создания текстуры
  graphics.destroy();
}; 