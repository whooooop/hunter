import * as Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { BaseProjectile, ProjectileType } from './BaseProjectile';
import { rayRectIntersectionRobust } from '../utils/GeometryUtils';

interface Hit {
  time: number;
  projectile: BaseProjectile;
  targetEntity: BaseEnemy;
  hitX: number;
  hitY: number;
}

export class HitManager {
  private scene: Phaser.Scene;
  private bulletHits: Hit[] = [];
  private enemies: Phaser.Physics.Arcade.Group;

  private projectiles: BaseProjectile[] = [];
  private projectileHits: Hit[] = [];

  constructor(
    scene: Phaser.Scene, 
    enemies: Phaser.Physics.Arcade.Group, 
  ) {
    this.scene = scene;
    this.enemies = enemies;
  }
  
  public addProjectile(projectile: BaseProjectile): void {
    this.projectiles.push(projectile);
  }

  private activateProjectile(projectile: BaseProjectile): void {
    const type = projectile.getType();
    if (type === ProjectileType.BULLET) {
      this.predictRayHits(projectile);
    } else if (type === ProjectileType.GRENADE) {
      this.predictRadiusHits(projectile);
    }
  }

  private predictRayHits(projectile: BaseProjectile): void {
    const hits: Hit[] = [];
    
    // Получаем вектор движения снаряда (две точки)
    const vectorPoints = projectile.getForceVector();
    const speed = projectile.getSpeed();
    
    // Получаем координаты начала и конца вектора
    const startX = vectorPoints[0][0];
    const startY = vectorPoints[0][1];
    const endX = vectorPoints[1][0];
    const endY = vectorPoints[1][1];
    
    // Вычисляем вектор направления
    const dirX = endX - startX;
    const dirY = endY - startY;
    
    // Нормализуем вектор
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;

    // Проверяем каждого врага на пересечение с продленным лучом
    this.enemies.getChildren().forEach((enemyObj: any) => {
      if (!enemyObj.active) return;
      
      const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
      if (!enemy) {
        console.warn('Не найдена ссылка на BaseEnemy:', enemyObj);
        return;
      }
      
      // Получаем границы тела врага
      const enemyBounds = enemy.getBounds();
      
      // Используем метод определения пересечений
      const intersection = rayRectIntersectionRobust(
        startX, startY, 
        normalizedDirX, normalizedDirY,
        enemyBounds.x, enemyBounds.y, 
        enemyBounds.right - enemyBounds.x, enemyBounds.bottom - enemyBounds.y
      );
      
      if (intersection) {
        const { hitX, hitY, distance } = intersection;
        const time = this.scene.time.now + (distance / speed * 1000);
        
        hits.push({
          time,
          projectile,
          targetEntity: enemy,
          hitX,
          hitY
        });
      }
    });

    // Сортируем попадания по времени (сначала ближайшие)
    hits.sort((a, b) => a.time - b.time);
    
    this.projectileHits.push(...hits);
  }

  private predictRadiusHits(projectile: BaseProjectile): void {
    const hits: Hit[] = [];
    
    // todo: поиск объектов в радиусе

    this.projectileHits.push(...hits);
  }
  
  private sliceCurrentHits(currentTime: number): Hit[] {
    const currentHits: Hit[] = [];
    this.projectileHits = this.projectileHits.reduce((acc: Hit[], hit: Hit) => {
      if (hit.time <= currentTime) currentHits.push(hit);
      else acc.push(hit);
      return acc;
    }, []);
    return currentHits;
  }

  /**
   * Обрабатывает попадания пуль в нужное время
   */
  public update(currentTime: number): void {
    // Ищем активные снаряды и запускаем проверку взаимодействия с объектами
    this.updateNotActivatedProjectiles(currentTime);

    // Обновляем попадания
    this.updateProjectileHits(currentTime);
  }

  private updateNotActivatedProjectiles(currentTime: number): void {
    this.projectiles = this.projectiles.filter(projectile => {
        if (projectile.getActivated()) {
          this.activateProjectile(projectile);
          return false;
        }
        return true;
      });
  }

  private updateProjectileHits(currentTime: number): void {
    const currentHits = this.sliceCurrentHits(currentTime);
    currentHits.forEach(hit => {
      console.log('hit', hit);
      // Проверяем, что цель все еще активна
      console.warn('Проверить, что цель все еще активна');
      // if (!hit.targetEntity.getActive()) return;

      // Обрабатываем урон врагу или объекту
      hit.targetEntity.takeDamage({
        damage: hit.projectile.getDamage(),
        forceVector: hit.projectile.getForceVector(),
        hitPoint: [hit.hitX, hit.hitY]
      });
      
      hit.projectile.onHit();
    });
  }
} 