import { generateId } from "../../utils/stringGenerator";
import { settings } from "../settings";
import { hexToNumber } from "../utils/colors";
import { ExplosionEntity } from "./entities/ExplosionEntity";

export enum ProjectileType {
  BULLET = 'bullet',
  GRENADE = 'grenade',
  MINE = 'mine',
}

export interface BaseProjectileOptions {
  type: ProjectileType;

  texture?: string;
  scale?: number;

  radius?: number;
  useRadiusDamage?: boolean;
  activateDelay?: number;
  activateRadius?: number;

  force?: number;
  bounce?: number;
  drag?: number;
  gravity?: number;
}

export type BaseProjectileClass = new (options?: BaseProjectileOptions) => BaseProjectile;

const defaultOptions = {
  type: ProjectileType.BULLET,
  bounce: 0.2,
  drag: 250,
  gravity: 700,
  radius: 200
}

export class BaseProjectile {
  protected id: string;
  protected scene!: Phaser.Scene;
  protected gameObject!: Phaser.GameObjects.Sprite;

  protected destroyed: boolean = false;
  protected activated: boolean = false;
  
  protected options: BaseProjectileOptions;
  protected damage: number = 1;
  protected speed: number[] = [100, 0];
  
  protected playerId!: string;
  protected weaponName!: string;
  
  // Точки, определяющие вектор
  protected startPoint: number[] = [0, 0];
  protected forcePoint: number[] = [0, 0];

  protected floorY: number = 0; // Минимальная Y-координата (пол)

  constructor(options?: BaseProjectileOptions) {
    this.id = generateId();
    this.options = { ...defaultOptions, ...options };
  }

  public getId(): string {
    return this.id;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getWeaponName(): string {
    return this.weaponName;
  }

  public create(scene: Phaser.Scene, x: number, y: number, params: { playerId: string, weaponName: string }): BaseProjectile {
    this.scene = scene;
    this.startPoint = [x, y];
    this.playerId = params.playerId;

    if (this.options.texture) {
      this.gameObject = new Phaser.GameObjects.Sprite(scene, x, y, this.options.texture);
      this.gameObject.setPosition(x, y);

      if (this.options.scale) {
        this.gameObject.setScale(this.options.scale);
      }
      
      this.scene.add.existing(this.gameObject);
    }

    return this;
  }

  public setForceVector(forceX: number, forceY: number, speed: number[], damage: number): BaseProjectile {
    this.damage = damage; // Сохраняем значение урона
    this.speed = speed;
    this.forcePoint = [forceX, forceY];
    
    if (this.options.type === ProjectileType.BULLET) {
      this.setRayForce(forceX, forceY);
      this.activate();
    } else if (this.options.type === ProjectileType.GRENADE) {
      this.setThrowForce(forceX, forceY);
    } else if (this.options.type === ProjectileType.MINE) {
      this.setThrowForce(forceX, forceY);
    }

    if (this.options.activateDelay) {
      this.scene.time.delayedCall(this.options.activateDelay, () => {
        this.activate();
      });
    }

    return this;
  }

  protected setRayForce(forceX: number, forceY: number): void {
    if (!this.gameObject) return;
    
    // Вычисляем вектор направления
    const dx = forceX - this.gameObject.x;
    const dy = forceY - this.gameObject.y;

    // Нормализуем вектор
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;

    // Задаем скорость движения
    const velocityX = normalizedDx * this.speed[0];
    const velocityY = normalizedDy * this.speed[1];

    // Поворачиваем спрайт пули по направлению движения
    const angle = Math.atan2(dy, dx);
    this.gameObject.setRotation(angle);

    // Добавляем физику, если спрайт существует
    this.scene.physics.world.enable(this.gameObject);
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
    // Устанавливаем скорость
    body
      .setAllowGravity(false)  
      .setVelocity(velocityX, velocityY);
  }

  /**
   * Устанавливает силу и направление для гранаты, создавая эффект
   * @param targetX X-координата цели
   * @param targetY Y-координата цели
   * @returns Экземпляр проектила для цепочки вызовов
   */
  public setThrowForce(targetX: number, targetY: number): BaseProjectile {
    if (!this.gameObject || !this.scene) return this;
    
    // Устанавливаем floorY равным начальной Y-координате гранаты
    this.floorY = this.gameObject.y;
    
    // Вычисляем направление
    const dx = targetX + this.speed[0];
    let dirX = 1;
    
    if (dx !== 0) {
      dirX = dx > 0 ? 1 : -1;
    }
    
    // Инициализируем физику
    this.scene.physics.world.enable(this.gameObject);
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
    
    // Задаем начальную скорость
    body.setVelocity(this.speed[0], this.speed[1] * -1);
    
    if (this.options.gravity) {
      body.setAllowGravity(true);
      body.setGravityY(this.options.gravity);
    }
    
    if (this.options.drag) {
      body.setDragX(this.options.drag);
    }
    
    if (this.options.bounce) {
      body.setBounce(this.options.bounce * 0.2);
    }
    
    return this;
  }
  
  public activate(): void {
    this.activated = true;
    // console.log('activate', this.options.type);
    if (this.options.type === ProjectileType.GRENADE || this.options.type === ProjectileType.MINE) {
      this.activateExplosion();
      this.gameObject.setAlpha(0);
      this.scene.time.delayedCall(1000, () => { 
        this.destroy();
      });
    }
  }

  protected activateExplosion(): void {
    // эффект взрыва
    ExplosionEntity.create(this.scene, this.gameObject.x, this.gameObject.y);
  }

  public onHit(): void {
    this.destroy();
  }

  public getActivated(): boolean {
    return this.activated;
  }

  public getPosition(): number[] {
    return [this.gameObject.x, this.gameObject.y];
  }

  public getType(): ProjectileType {
    return this.options.type;
  }

  public getSpeed(): number[] {
    return this.speed;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public getRadius(): number {
    return this.options.radius || 0;
  }

  public getActivateRadius(): number {
    return this.options.activateRadius || 0;
  }

  public getDamage(distance: number = 0): number {
    // Вычисляем урон в зависимости от расстояния до центра взрыва
    // Чем ближе к центру, тем больше урон
    if (this.options.useRadiusDamage) {
      const radius = this.getRadius();
      const multiplier = Math.max(0, 1 - (distance / radius));
      return this.damage * multiplier;
    }

    return this.damage;
  }

  public destroy () {
    this.destroyed = true;
    
    if (this.gameObject) {
      this.gameObject.destroy();
    }
  }

  public update(time: number, delta: number): void {
    if (this.destroyed) return;
    
    this.gameObject.setDepth(this.gameObject.y + settings.gameplay.depthOffset);

    // Для гранат выполняем дополнительные проверки
    if (this.options.type === ProjectileType.GRENADE || this.options.type === ProjectileType.MINE) {
      this.updateThrow(time, delta);
    }

    // Проверяем, не вышла ли пуля за границы мира
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
    if (body && (
        this.gameObject.x < 0 || 
        this.gameObject.y < 0 || 
        this.gameObject.x > this.scene.physics.world.bounds.width || 
        this.gameObject.y > this.scene.physics.world.bounds.height
    )) {
      this.destroy();
    }
  }

  protected updateThrow(time: number, delta: number): void {
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    
    // Проверяем, достигла ли граната уровня пола
    if (body.y >= this.floorY && body.velocity.y > 0) {
      // Не позволяем гранате опуститься ниже начальной Y-координаты
      body.y = this.floorY;
      
      // Меняем направление движения вверх с небольшим затуханием
      if (Math.abs(body.velocity.y) < 30) {
        // Если скорость уже очень мала, останавливаем гранату
        body.setVelocityY(0);
        body.setAccelerationY(0);
        body.setAllowGravity(false);
      } else {
        // Отражаем снаряд вверх с уменьшенной скоростью
        body.setVelocityY(-body.velocity.y * 0.6);
      }
    }
    
    // Проверяем полную остановку гранаты
    const velocityMagnitude = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
    
    // Поворачиваем спрайт в направлении движения
    if (velocityMagnitude > 10 && this.options.type === ProjectileType.GRENADE) {
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      this.gameObject.setRotation(angle);
    }
  }

  /**
   * Возвращает вектор направления снаряда в формате [[startX, startY], [endX, endY]]
   * для использования в системе определения попаданий
   */
  public getForceVector(): number[][] {
    return [
      this.startPoint,
      this.forcePoint
    ]
  }
}

export const createBulletTexture = (scene: Phaser.Scene, name: string, width: number = 40, height: number = 2, color: string = '#b7f191'): void => {
  // Проверяем, существует ли уже такая текстура
  if (scene.textures.exists(name)) {
    scene.textures.remove(name);
  }

  const graphics = scene.add.graphics();
  const textureColor = hexToNumber(color);  

  graphics.fillStyle(textureColor, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height,height / 2);
  graphics.generateTexture(name, width, height);
  graphics.destroy();
}; 