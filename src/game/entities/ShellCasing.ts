import * as Phaser from 'phaser';
import { settings } from '../settings';
import { GameplayScene } from '../scenes/GameplayScene';

/**
 * Класс представляющий гильзу оружия
 */
export class ShellCasing extends Phaser.Physics.Arcade.Sprite {
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
    // Слегка смещаем позицию гильзы относительно точки выстрела
    const offsetX = direction > 0 ? -15 : 15;
    const offsetY = -10; // Немного выше точки выстрела
    
    // Получаем координаты для создания гильзы
    const shellX = x + offsetX;
    const shellY = y + offsetY;
    
    super(scene, shellX, shellY, 'shell_casing');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(settings.gameplay.shellCasings.scale);
    this.setDepth(100); // Устанавливаем высокую глубину отображения
    
    // Устанавливаем пол для гильзы немного ниже места появления
    // Y + 20 должно быть близко к ногам персонажа, не давая гильзе упасть слишком низко
    this.floorLevel = y + 20;
    
    // Добавляем гильзу в группу гильз сцены
    if (scene instanceof GameplayScene) {
      const gameScene = scene as GameplayScene;
      
      // Проверяем, не превышено ли количество гильз на сцене
      if (gameScene.getShellCasingsGroup().getLength() >= settings.gameplay.shellCasings.maxShells) {
        const allShells = gameScene.getShellCasingsGroup().getChildren();
        if (allShells.length > 0) {
            // Берем первый элемент в группе (самый старый)
            const oldestShell = allShells[0];
            oldestShell.destroy();
        }
      }
      
      gameScene.addShellCasing(this);
    }
    
    // Применяем физические свойства
    this.applyPhysics(direction);
    
    // Устанавливаем время жизни гильзы, если оно настроено
    this.setupLifetime();
  }
  
  /**
   * Применяет физические свойства к гильзе
   * @param direction Направление выстрела
   */
  private applyPhysics(direction: number): void {
    // Рассчитываем угол выброса гильзы (с небольшой случайностью)
    const ejectionAngle = Phaser.Math.DegToRad(
      settings.gameplay.shellCasings.ejectionAngle + Phaser.Math.Between(-15, 15)
    );
    
    // Скорость выброса с небольшой случайностью
    const ejectionSpeed = settings.gameplay.shellCasings.ejectionSpeed + Phaser.Math.Between(-20, 20);
    
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
    this.setDragX(settings.gameplay.shellCasings.dragX);
    this.setBounce(settings.gameplay.shellCasings.bounce);
    this.setGravityY(settings.gameplay.shellCasings.gravity);
  }
  
  /**
   * Настраивает время жизни гильзы
   */
  private setupLifetime(): void {
    // Если задано время жизни гильз, добавляем таймер на удаление
    if (settings.gameplay.shellCasings.lifetime > 0) {
      this.scene.time.delayedCall(settings.gameplay.shellCasings.lifetime, () => {
        this.destroy();
      });
    }
  }
  
  /**
   * Обновляет состояние гильзы (вызывается каждый кадр)
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    
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
    this.setDragX(settings.gameplay.shellCasings.dragX * 2);
    
    // Гасим вертикальную скорость и устанавливаем позицию точно на уровне пола
    this.setVelocityY(0);
    this.y = this.floorLevel;
    
    // Устанавливаем задержку для проверки, остановилась ли гильза
    this.scene.time.delayedCall(500, () => {
      if (this.active && this.body) {
        // Если скорость гильзы близка к нулю, она лежит спокойно
        if (Math.abs(this.body.velocity.x) < 5) {
          // Отключаем обновление физики для этой гильзы
          this.disableBody(true, false);
          
          // Отключаем автоматический вызов preUpdate для этого объекта
          this.setActive(false);
          
          // Оставляем гильзу видимой
          this.setVisible(true);
        }
      }
    });
  }
} 