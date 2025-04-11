import * as Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { BaseBullet, BaseBulletOptions } from './BaseBullet';
import { LocationObject } from './LocationObject';

interface Hit {
  time: number;
  targetObj: Phaser.Physics.Arcade.Sprite;
  targetEntity: BaseEnemy | LocationObject | null;
  damage: number;
  direction: number;
  hitX: number;
  hitY: number;
  bulletSprite?: Phaser.Physics.Arcade.Sprite;
}

export class HitManager {
  private scene: Phaser.Scene;
  private bulletHits: Hit[] = [];
  private enemies: Phaser.Physics.Arcade.Group;
  private interactiveObjects: Phaser.Physics.Arcade.Group;
  
  constructor(
    scene: Phaser.Scene, 
    enemies: Phaser.Physics.Arcade.Group, 
    interactiveObjects: Phaser.Physics.Arcade.Group
  ) {
    this.scene = scene;
    this.enemies = enemies;
    this.interactiveObjects = interactiveObjects;
  }
  
  /**
   * Добавляет пулю с предварительным расчетом столкновений
   */
  public addPredictiveBullet(
    x: number, 
    y: number, 
    targetX: number, 
    targetY: number, 
    speed: number, 
    damage: number, 
    range: number,
    bulletOptions?: BaseBulletOptions
  ): Phaser.Physics.Arcade.Sprite | null {
    // Создаем пулю
    const bullet = new BaseBullet(this.scene, x, y, bulletOptions);
    const bulletSprite = bullet.getSprite();
    
    // Рассчитываем направление и скорость
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    // Устанавливаем скорость
    bulletSprite.setVelocity(velocityX, velocityY);
    bulletSprite.setRotation(angle);
    
    // Определяем направление для эффектов
    const direction = Math.sign(velocityX);
    
    // Проверяем, есть ли потенциальные коллизии
    const hits = this.calculateBulletRayCast(x, y, angle, speed, range, damage, direction);
    
    // Если есть потенциальные попадания, добавляем их в массив
    if (hits.length > 0) {
      // Добавляем ссылку на sprite пули, чтобы можно было его уничтожить при попадании
      hits.forEach(hit => {
        hit.bulletSprite = bulletSprite;
        this.bulletHits.push(hit);
      });
    }
    
    // Если нет попаданий, пуля исчезнет сама по достижении максимальной дальности
    const maxFlightTime = range / speed * 1000; // время в мс
    setTimeout(() => {
      if (bulletSprite.active) {
        bulletSprite.destroy();
      }
    }, maxFlightTime);
    
    // Активируем пулю
    bullet.fire(x, y, targetX, targetY, speed, damage, range);
    
    return bulletSprite;
  }
  
  /**
   * Рассчитывает точки пересечения луча пули с объектами
   */
  private calculateBulletRayCast(
    startX: number, 
    startY: number, 
    angle: number, 
    speed: number, 
    range: number,
    damage: number,
    direction: number
  ): Hit[] {
    const hits: Hit[] = [];
    
    // Предельная точка траектории пули
    const endX = startX + Math.cos(angle) * range;
    const endY = startY + Math.sin(angle) * range;
    
    // Проверяем все потенциальные цели (врагов)
    this.enemies.getChildren().forEach(enemyObj => {
      if (!(enemyObj instanceof Phaser.Physics.Arcade.Sprite)) return;
      
      const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
      if (!enemy) return;
      
      // Получаем ограничивающий прямоугольник
      const bounds = enemyObj.getBounds();
      
      // Проверяем пересечение луча с границами объекта
      const intersection = this.lineRectIntersection(
        startX, startY, endX, endY,
        bounds.x, bounds.y, bounds.width, bounds.height
      );
      
      if (intersection) {
        // Расстояние от начала до пересечения
        const distance = Phaser.Math.Distance.Between(startX, startY, intersection.x, intersection.y);
        
        // Время до попадания (в миллисекундах)
        const time = this.scene.time.now + (distance / speed * 1000);
        
        hits.push({
          time,
          targetObj: enemyObj,
          targetEntity: enemy,
          damage,
          direction,
          hitX: intersection.x,
          hitY: intersection.y
        });
      }
    });
    
    // Проверяем все интерактивные объекты
    this.interactiveObjects.getChildren().forEach(objSprite => {
      if (!(objSprite instanceof Phaser.Physics.Arcade.Sprite)) return;
      
      const locationObject = objSprite.getData('objectRef') as LocationObject;
      if (!locationObject) return;
      
      // Получаем ограничивающий прямоугольник
      const bounds = objSprite.getBounds();
      
      // Проверяем пересечение луча с границами объекта
      const intersection = this.lineRectIntersection(
        startX, startY, endX, endY,
        bounds.x, bounds.y, bounds.width, bounds.height
      );
      
      if (intersection) {
        // Расстояние от начала до пересечения
        const distance = Phaser.Math.Distance.Between(startX, startY, intersection.x, intersection.y);
        
        // Время до попадания (в миллисекундах)
        const time = this.scene.time.now + (distance / speed * 1000);
        
        hits.push({
          time,
          targetObj: objSprite,
          targetEntity: locationObject,
          damage,
          direction,
          hitX: intersection.x,
          hitY: intersection.y
        });
      }
    });
    
    // Сортируем попадания по времени (сначала ближайшие)
    hits.sort((a, b) => a.time - b.time);
    
    return hits.length > 0 ? hits : [];
  }
  
  /**
   * Вычисляет пересечение линии с прямоугольником, используя центральные линии
   */
  private lineRectIntersection(
    x1: number, y1: number, x2: number, y2: number,
    rectX: number, rectY: number, rectWidth: number, rectHeight: number
  ): { x: number, y: number } | null {
    // Вычисляем центр прямоугольника
    const centerX = rectX + rectWidth / 2;
    const centerY = rectY + rectHeight / 2;
    
    // Проверяем пересечение с горизонтальной центральной линией
    const horizontal = this.lineLineIntersection(
      x1, y1, x2, y2,
      rectX, centerY, rectX + rectWidth, centerY
    );
    
    // Если есть пересечение с горизонтальной линией, возвращаем его
    if (horizontal) {
      return horizontal;
    }
    
    // Проверяем пересечение с вертикальной центральной линией
    const vertical = this.lineLineIntersection(
      x1, y1, x2, y2,
      centerX, rectY, centerX, rectY + rectHeight
    );
    
    // Возвращаем пересечение с вертикальной линией (может быть null)
    return vertical;
  }
  
  /**
   * Вычисляет пересечение двух линий
   */
  private lineLineIntersection(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): { x: number, y: number } | null {
    // Вычисляем знаменатель
    const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    
    // Если линии параллельны
    if (den === 0) {
      return null;
    }
    
    // Вычисляем параметры t и u
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
    
    // Проверяем, находится ли пересечение в пределах обоих отрезков
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      // Вычисляем координаты точки пересечения
      const x = x1 + ua * (x2 - x1);
      const y = y1 + ua * (y2 - y1);
      
      return { x, y };
    }
    
    return null;
  }
  
  /**
   * Обрабатывает попадания пуль в нужное время
   */
  public update(currentTime: number): void {
    // Находим все попадания, которые должны произойти сейчас
    const currentHits = this.bulletHits.filter(hit => hit.time <= currentTime);
    
    // Удаляем их из списка
    this.bulletHits = this.bulletHits.filter(hit => hit.time > currentTime);
    
    // Обрабатываем каждое попадание
    currentHits.forEach(hit => {
      // Проверяем, что цель все еще активна
      if (!hit.targetObj.active) return;
      
      // Обрабатываем урон врагу или объекту
      if (hit.targetEntity instanceof BaseEnemy) {
        const enemy = hit.targetEntity as BaseEnemy;
        enemy.takeDamage({
          damage: hit.damage,
          direction: hit.direction,
          x: hit.hitX,
          y: hit.hitY,
        });
      } else if (hit.targetEntity instanceof LocationObject) {
        const object = hit.targetEntity as LocationObject;
        object.takeDamage(hit.damage);
      }
      
      // Уничтожаем спрайт пули, если он существует
      if (hit.bulletSprite && hit.bulletSprite.active) {
        hit.bulletSprite.destroy();
      }
    });
  }

} 