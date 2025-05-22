import * as Phaser from 'phaser';
import { ProjectileEntity } from '../entities/ProjectileEntity';
import { rayRectIntersectionRobust } from '../utils/GeometryUtils';
import { Weapon } from '../types/weaponTypes';
import { createProjectile } from '../projectiles';
import { emitEvent, offEvent, onEvent } from '../GameEvents';
import { Projectile, Damageable, Game } from '../types/';
import { WeaponType } from '../weapons/WeaponTypes';
import { DEBUG } from '../config';

interface Hit {
  projectile: ProjectileEntity;
  targetEntity: Damageable.Entity;
  hitPoint: number[];
  forceVector: number[][];
  distance: number;
  time: number;
}

interface HitGroup {
  hits: Hit[];
  time: number;
}

export class ProjectileController {
  private scene: Phaser.Scene;
  private damageableObjects: Map<string, Damageable.Entity>;
  private projectiles: Set<ProjectileEntity> = new Set();
  private projectilesNotActivated: Set<ProjectileEntity> = new Set();
  private projectileHits: HitGroup[] = [];
  private simulate: boolean;

  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  constructor(
    scene: Phaser.Scene, 
    damageableObjects: Map<string, Damageable.Entity>, 
  ) {
    this.scene = scene;
    this.damageableObjects = damageableObjects;
    this.simulate = true;
    this.debugGraphics = this.scene.add.graphics();

    onEvent(scene, Weapon.Events.CreateProjectile.Local, this.handleCreateProjectile, this);
  }
  
  public handleCreateProjectile({ projectile, originPoint, targetPoint, playerId, weaponName, speed, damage }: Weapon.Events.CreateProjectile.Payload): void {
    const objects = createProjectile(this.scene, projectile, originPoint, targetPoint, playerId, weaponName, speed, damage);
    objects.forEach(object => {
      this.projectiles.add(object);
      this.projectilesNotActivated.add(object);
    });
  }

  private activateProjectile(projectile: ProjectileEntity): void {
    const type = projectile.getType();
    if (type === Projectile.Type.BULLET) {
      this.predictRayHits(projectile);
    } else if (type === Projectile.Type.GRENADE || type === Projectile.Type.MINE) {
      this.predictRadiusHits(projectile);
    }
  }

  public setSimulate(simulate: boolean): void {
    this.simulate = simulate;
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
      
      const enemyBounds = enemy.getBodyBounds();
      
      // Используем метод определения пересечений
      const intersection = rayRectIntersectionRobust(
        startX, startY, 
        normalizedDirX, normalizedDirY,
        enemyBounds.x, enemyBounds.y, 
        enemyBounds.width, enemyBounds.height
      );
      
      if (intersection) {
        const { hitX, hitY, distance } = intersection;
        const time = this.scene.time.now + (distance / speed[0] * 1000);
        
        group.hits.push({
          time,
          projectile,
          targetEntity: enemy,
          forceVector: projectile.getForceVector(),
          hitPoint: [hitX, hitY],
          distance,
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
      const enemyBounds = enemy.getBodyBounds();
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
    if (DEBUG.PROJECTILES) {
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
    this.debugGraphics?.lineStyle(2, 0xff0000, 0.7);
    this.debugGraphics?.strokeCircle(x, y, radius);
    this.debugGraphics?.fillStyle(0xff0000, 0.7);
    this.debugGraphics?.fillCircle(x, y, 5);
    this.debugGraphics?.setDepth(1000);
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
    if (DEBUG.PROJECTILES) {
      this.debugGraphics?.clear();
    }

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
        const enemyBounds = enemy.getBodyBounds();
        
        // Получаем центр врага
        const enemyCenter = {
            x: enemyBounds.x + enemyBounds.width / 2,
            y: enemyBounds.y + enemyBounds.height * 0.9
        };

        const [x, y] = projectile.getPosition();

        if (DEBUG.PROJECTILES) {
          this.drawExplosionRadius(x, y, activateRadius);
          this.drawExplosionRadius(enemyCenter.x, enemyCenter.y, 1);
        }

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
      let damageForBullet = group.hits[0].projectile.getDamage(group.hits[0].distance);
      let deathCount = 0;
      let weaponName: WeaponType | null = null;
      let projectileType: Projectile.Type | null = null;

      for (const [index, hit] of group.hits.entries()) {
        if (hit.targetEntity.getDead()) return;
        weaponName = hit.projectile.getWeaponName();
        projectileType = hit.projectile.getType();

        const isBullet = projectileType === Projectile.Type.BULLET;
        const damage = isBullet ? damageForBullet : hit.projectile.getDamage(hit.distance);   
        const damageResult = hit.targetEntity.takeDamage({
          simulate: this.simulate,
          forceVector: hit.forceVector,
          hitPoint: hit.hitPoint,
          value: damage,
          playerId: hit.projectile.getPlayerId(),
          weaponName,
          distance: hit.distance,
          penetratedCount: index
        });       
        
        if(damageResult?.isDead) {
          deathCount++;
        }
          
        if (isBullet) {
          if (damageResult && !damageResult.isPenetrated) {
            break;
          } else {
            // Уменьшаем урон пули на 50%
            damageForBullet = Math.ceil(damageForBullet * 0.5);
          }
        }
      }

      if(deathCount >= 2 && weaponName && projectileType) {
        emitEvent(this.scene, Game.Events.Stat.Local, {
          event: Game.Events.Stat.DubleKillEvent.Event,
          data: { weaponName, projectileType }
        });
      }
      if(deathCount >= 3 && weaponName && projectileType) {
        emitEvent(this.scene, Game.Events.Stat.Local, {
          event: Game.Events.Stat.TripleKillEvent.Event,
          data: { weaponName, projectileType }
        });
      }
    });
  }

  public destroy(): void {
    offEvent(this.scene, Weapon.Events.CreateProjectile.Local, this.handleCreateProjectile, this);
  }
} 