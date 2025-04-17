import * as Phaser from 'phaser';
import { ProjectileEntity, ProjectileType } from '../entities/ProjectileEntity';
import { rayRectIntersectionRobust } from '../../utils/GeometryUtils';
import { DamageableEntity } from '../entities/DamageableEntity';

export enum ProjectileEvents {
  ProjectileHit = 'ProjectileHit',
}

interface Hit {
  projectile: ProjectileEntity;
  targetEntity: DamageableEntity;
  hitPoint: number[];
  forceVector: number[][];
  distance?: number;
  time: number;
}

interface HitGroup {
  hits: Hit[];
  time: number;
}

interface ProjectileControllerOptions {
  simulate: boolean;
}

export class ProjectileController {
  private debug: boolean = false;
  private scene: Phaser.Scene;
  private damageableObjects: Set<DamageableEntity>;
  private projectiles: Map<ProjectileEntity, ProjectileEntity> = new Map();
  private projectilesNotActivated: Map<ProjectileEntity, ProjectileEntity> = new Map();
  private projectileHits: HitGroup[] = [];
  private simulate: boolean;

  constructor(
    scene: Phaser.Scene, 
    damageableObjects: Set<DamageableEntity>, 
    options: ProjectileControllerOptions
  ) {
    this.scene = scene;
    this.damageableObjects = damageableObjects;
    this.simulate = options.simulate;
  }
  
  public addProjectile(projectile: ProjectileEntity): void {
    this.projectiles.set(projectile, projectile);
    this.projectilesNotActivated.set(projectile, projectile);
  }

  private activateProjectile(projectile: ProjectileEntity): void {
    const type = projectile.getType();
    if (type === ProjectileType.BULLET) {
      this.predictRayHits(projectile);
    } else if (type === ProjectileType.GRENADE || type === ProjectileType.MINE) {
      this.predictRadiusHits(projectile);
    }
  }

  private predictRayHits(projectile: ProjectileEntity): void {
    const group: HitGroup = {
      hits: [],
      time: 0
    };
    
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
    this.damageableObjects.forEach((enemy) => {
      if (enemy.getDead()) return;
      
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
        const time = this.scene.time.now + (distance / speed[0] * 1000);
        
        group.hits.push({
          time,
          projectile,
          targetEntity: enemy,
          forceVector: projectile.getForceVector(),
          hitPoint: [hitX, hitY]
        });
      }
    });

    // Сортируем попадания по времени (сначала ближайшие)
    if (group.hits.length > 0) {
      group.hits.sort((a, b) => a.time - b.time);
      group.time = group.hits[0].time;
      this.projectileHits.push(group);
    }
  }

  private predictRadiusHits(projectile: ProjectileEntity): void {
    if (!this.scene || projectile.isDestroyed()) return;
    
    // Получаем актуальные координаты проектиля
    const [x, y] = projectile.getPosition();
    
    // Получаем радиус действия из проектиля
    const radius = projectile.getRadius();
    
    // Массив для хранения обнаруженных попаданий
    const group: HitGroup = {
      hits: [],
      time: 0
    };
    
    // Время активации взрыва (текущее время)
    const explosionTime = this.scene.time.now;
    // Проверяем всех врагов на нахождение в радиусе взрыва
    this.damageableObjects.forEach((enemy) => {
      if (enemy.getDead()) return;
      
      // Получаем границы врага
      const enemyBounds = enemy.getBounds();
      if (!enemyBounds) return;
      
      // Получаем центр врага
      const enemyCenter = {
          x: enemyBounds.x + enemyBounds.width / 2,
          y: enemyBounds.y + enemyBounds.height / 2
      };
      
      // Вычисляем расстояние от центра взрыва до центра врага
      const distance = Phaser.Math.Distance.Between(x, y, enemyCenter.x, enemyCenter.y);
      // Проверяем, находится ли враг в радиусе взрыва
      if (distance <= radius) {
          // Вычисляем точку попадания (на прямой между центром взрыва и врагом)
          const angle = Math.atan2(enemyCenter.y - y, enemyCenter.x - x);
          const hitPoint = {
              x: x + Math.cos(angle) * Math.min(distance, radius),
              y: y + Math.sin(angle) * Math.min(distance, radius)
          };
          
          group.hits.push({
              time: explosionTime,
              projectile,
              distance,
              targetEntity: enemy,
              hitPoint: [hitPoint.x, hitPoint.y],
              forceVector: [
                [x, y],
                [hitPoint.x, hitPoint.y]
              ]
          });
      }
    });
    
    // Отображаем отладочный круг взрыва, если включен режим отладки
    if (this.debug) {
        this.drawExplosionRadius(x, y, radius);
    }
    
    // Добавляем все попадания в общий список
    if (group.hits.length > 0) {
      group.time = group.hits[0].time;
      this.projectileHits.push(group);
    }
  }

  /**
   * Рисует отладочный круг для визуализации радиуса взрыва
   */
  private drawExplosionRadius(x: number, y: number, radius: number): void {
    if (!this.scene) return;
    
    // Создаем графический объект
    const graphics = this.scene.add.graphics();
    
    // Настраиваем стиль для контура
    graphics.lineStyle(2, 0xff0000, 0.7);
    
    // Рисуем круг радиуса взрыва
    graphics.strokeCircle(x, y, radius);
    
    // Рисуем центр взрыва
    graphics.fillStyle(0xff0000, 0.7);
    graphics.fillCircle(x, y, 5);
    
    // Устанавливаем высокий z-index для отображения поверх других объектов
    graphics.setDepth(1000);
    
    // Удаляем графику через 2 секунды
    this.scene.time.delayedCall(2000, () => {
        graphics.destroy();
    });
  }
  
  private sliceCurrentHits(currentTime: number): HitGroup[] {
    const currentHits: HitGroup[] = [];
    this.projectileHits = this.projectileHits.reduce((acc: HitGroup[], group: HitGroup) => {
      if (group.time <= currentTime) currentHits.push(group);
      else acc.push(group);
      return acc;
    }, []);
    return currentHits;
  }

  /**
   * Обрабатывает попадания пуль в нужное время
   */
  public update(currentTime: number, delta: number): void {
    // console.log('size', this.projectilesNotActivated.size, this.projectiles.size, this.projectileHits.length, this.enemies.size);
    // Ищем активные снаряды и запускаем проверку взаимодействия с объектами
    this.updateNotActivatedProjectiles(currentTime);

    // Обновляем попадания
    this.updateProjectileHits(currentTime);

    // Обновляем снаряды
    this.updateProjectiles(currentTime, delta);

    this.updateActivationByRadius(currentTime, delta);
  }

  private updateProjectiles(currentTime: number, delta: number): void {
    this.projectiles.forEach((projectile) => {
      projectile.update(currentTime, delta);
      if (projectile.isDestroyed()) {
        this.projectiles.delete(projectile);
      }
    });
  }

  private updateNotActivatedProjectiles(currentTime: number): void {
    this.projectilesNotActivated.forEach(projectile => {
      if (projectile.getActivated()) {
        this.activateProjectile(projectile);
        this.projectilesNotActivated.delete(projectile);
      }
    });
  }

  private updateActivationByRadius(currentTime: number, delta: number): void {
    this.projectiles.forEach(projectile => {
      const activateRadius = projectile.getActivateRadius();
      if (!activateRadius) {
        return;
      }

      this.damageableObjects.forEach((enemy) => {
        if (enemy.getDead()) return;
        
        // Получаем границы врага
        const enemyBounds = enemy.getBounds();
        if (!enemyBounds) return;
        
        // Получаем центр врага
        const enemyCenter = {
            x: enemyBounds.x + enemyBounds.width / 2,
            y: enemyBounds.y + enemyBounds.height / 2
        };
        const [x, y] = projectile.getPosition();
        const radius = activateRadius;
        const distance = Phaser.Math.Distance.Between(x, y, enemyCenter.x, enemyCenter.y);
        if (distance <= radius) {
          projectile.activate();
        }
      });
    });
  }

  private updateProjectileHits(currentTime: number): void {
    // Получаем все попадания, которые должны произойти в текущий момент
    const currentHits = this.sliceCurrentHits(currentTime);

    currentHits.forEach(group => {
      for (const [index, hit] of group.hits.entries()) {
        if (hit.targetEntity.getDead()) return;

        const damage = hit.projectile.getDamage(hit.distance);     
        const damageResult = hit.targetEntity.takeDamage({
          simulate: this.simulate,
          forceVector: hit.forceVector,
          hitPoint: hit.hitPoint,
          value: damage,
          playerId: hit.projectile.getPlayerId(),
          weaponName: hit.projectile.getWeaponName(),
        });       
        hit.projectile.onHit();
        
        this.scene.events.emit(ProjectileEvents.ProjectileHit, hit);

        if (hit.projectile.getType() === ProjectileType.BULLET && damageResult && !damageResult.isPenetrated) {
          break;
        }
      }
    });
  }
} 