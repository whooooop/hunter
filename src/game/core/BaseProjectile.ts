import { hexToNumber } from "../utils/colors";

export enum ProjectileType {
  BULLET = 'bullet',
  GRENADE = 'grenade',
}

export interface BaseProjectileOptions {
  type: ProjectileType;

  texture?: string;
  scale?: number;

  force?: number;
}

export type BaseProjectileClass = new (options?: BaseProjectileOptions) => BaseProjectile;

const defaultOptions = {
  type: ProjectileType.BULLET
}

export class BaseProjectile {
  protected scene!: Phaser.Scene;
  protected gameObject!: Phaser.GameObjects.Sprite;

  protected options: BaseProjectileOptions;
  protected damage: number = 1;
  protected speed: number = 100;
  protected directionVector: { x: number, y: number } = { x: 0, y: 0 };
  
  // Точки, определяющие вектор
  protected startPoint: number[] = [0, 0];
  protected forcePoint: number[] = [0, 0];
  protected grenadeStartPos: { x: number, y: number } = { x: 0, y: 0 };
  protected grenadeTargetPos: { x: number, y: number } = { x: 0, y: 0 };

  private isActivated: boolean = false;
  private isProcessed: boolean = false;

  protected gravity: number = 0;
  protected initialVelocity: { x: number, y: number } = { x: 0, y: 0 };
  protected floorY: number = 0; // Минимальная Y-координата (пол)
  protected startTime: number = 0;
  protected maxLifeTime: number = 5000; // Максимальное время жизни гранаты в мс

  constructor(options?: BaseProjectileOptions) {
    this.options = { ...defaultOptions, ...options };
  }

  public create(scene: Phaser.Scene, x: number, y: number): BaseProjectile {
    this.scene = scene; // Сохраняем ссылку на сцену перед её использованием
    this.startPoint = [x, y];
    if (this.options.texture) {
      this.gameObject = new Phaser.GameObjects.Sprite(scene, x, y, this.options.texture);
      this.gameObject.setDepth(100);
      this.gameObject.setPosition(x, y);

      if (this.options.scale) {
        this.gameObject.setScale(this.options.scale);
      }
      
      // Устанавливаем обработчик update для gameObject
      const originalUpdate = this.gameObject.update;
      this.gameObject.update = (time: number, delta: number) => {
        console.log('update', time, delta);
        originalUpdate(time, delta);
        if (!this.isActivated || !this.gameObject.active) return;
        
        // Для гранат выполняем дополнительные проверки
        if (this.options.type === ProjectileType.GRENADE) {
          const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
          
          // Проверяем, достигла ли граната уровня пола
          if (body && body.y >= this.floorY && body.velocity.y > 0) {
            console.log('Граната достигла начальной высоты!');
            
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
          
          // Поворачиваем спрайт в направлении движения
          if (body) {
            const angle = Math.atan2(body.velocity.y, body.velocity.x);
            this.gameObject.setRotation(angle);
          }
        }
      };
      
      this.scene.add.existing(this.gameObject);
    }

    return this;
  }

  public setForceVector(forceX: number, forceY: number, speed: number, damage: number): BaseProjectile {
    this.damage = damage; // Сохраняем значение урона
    this.speed = speed;
    this.forcePoint = [forceX, forceY];
    
    if (this.options.type === ProjectileType.BULLET) {
      this.setRayForce(forceX, forceY, speed);
      this.activate();
    } else if (this.options.type === ProjectileType.GRENADE) {
      this.setGrenadeForce(forceX + 200, forceY, speed, damage);
      // this.activate();
    }

    return this;
  }

  protected setRayForce(forceX: number, forceY: number, speed: number): void {
    if (!this.gameObject || !this.scene) return;
    
    // Вычисляем вектор направления
    const dx = forceX - this.gameObject.x;
    const dy = forceY - this.gameObject.y;

    // Нормализуем вектор
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;

    // Задаем скорость движения
    const velocityX = normalizedDx * speed;
    const velocityY = normalizedDy * speed;

    // Поворачиваем спрайт пули по направлению движения
    const angle = Math.atan2(dy, dx);
    this.gameObject.setRotation(angle);

    // Добавляем физику, если спрайт существует
    this.scene.physics.world.enable(this.gameObject);
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;

    // Устанавливаем скорость
    body.setVelocity(velocityX, velocityY);
    
    // Отключаем гравитацию для пуль
    body.setAllowGravity(false);
    
    // Настраиваем коллайдер для проверки границ мира
    body.setCollideWorldBounds(true);
    body.onWorldBounds = true;
    
    // Настраиваем колбэк для уничтожения при столкновении с границами
    this.scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this.gameObject) {
        this.destroy();
      }
    });
    
    // Если сцена - это GameplayScene, добавляем обработку столкновений
    if (this.scene.constructor.name === 'GameplayScene') {
      const gameScene = this.scene as any;
      
      // Получаем группу врагов
      const enemies = gameScene.getEnemiesGroup();
      
      // Добавляем коллизию с врагами
      this.scene.physics.add.overlap(
        this.gameObject, 
        enemies,
        (bulletObj: any, enemyObj: any) => {
          // Получаем ссылку на объект врага
          const enemy = enemyObj.getData('enemyRef');
          if (!enemy) return;
          
          // Наносим урон врагу
          enemy.takeDamage({
            damage: this.damage,
            forceVector: this.getForceVector(),
            hitPoint: [bulletObj.x, bulletObj.y]
          });
          
          // Уничтожаем пулю
          this.destroy();
        }
      );
    }
  }

  /**
   * Устанавливает силу и направление для гранаты, создавая эффект дугообразной траектории
   * @param targetX X-координата цели
   * @param targetY Y-координата цели
   * @param throwForce Сила броска (влияет на дальность)
   * @param damage Урон от гранаты
   * @returns Экземпляр проектила для цепочки вызовов
   */
  public setGrenadeForce(targetX: number, targetY: number, throwForce: number, damage: number): BaseProjectile {
    if (!this.gameObject || !this.scene) return this;
    
    this.damage = damage;
    this.speed = throwForce;
    // Устанавливаем floorY равным начальной Y-координате гранаты
    this.floorY = this.gameObject.y;
    
    // Вычисляем направление
    const dx = targetX - this.gameObject.x;
    let dirX = 1;
    
    if (dx !== 0) {
      dirX = dx > 0 ? 1 : -1;
    }
    
    // Горизонтальная скорость (зависит от силы броска)
    const speedX = Math.min(throwForce, 300) * dirX;
    
    // Вертикальная скорость (всегда вверх в начале)
    const speedY = -300; // Сильный начальный импульс вверх
    
    console.log('Настройка гранаты:', {
      start: [this.gameObject.x, this.gameObject.y],
      direction: dirX,
      speedX,
      speedY,
      floorY: this.floorY
    });
    
    // Инициализируем физику
    this.scene.physics.world.enable(this.gameObject);
    const body = this.gameObject.body as Phaser.Physics.Arcade.Body;
    
    // Задаем начальную скорость
    body.setVelocity(speedX, speedY);
    
    // Включаем гравитацию для гранаты
    body.setAllowGravity(true);
    body.setGravityY(1000);
    
    // Включаем отскок (можно настроить)
    body.setBounce(0.6);
    
    // Настраиваем колизию с границами мира
    body.setCollideWorldBounds(true);
    
    // Если сцена - это GameplayScene, добавляем обработку столкновений
    if (this.scene.constructor.name === 'GameplayScene') {
      const gameScene = this.scene as any;
      
      // Получаем группу врагов
      const enemies = gameScene.getEnemiesGroup();
      
      // Добавляем коллизию с врагами
      this.scene.physics.add.overlap(
        this.gameObject, 
        enemies,
        (grenadeObj: any, enemyObj: any) => {
          // Получаем ссылку на объект врага
          const enemy = enemyObj.getData('enemyRef');
          if (!enemy) return;
          
          // Создаем эффект взрыва
          this.createExplosionEffect();
          
          // Наносим урон врагу
          enemy.takeDamage({
            damage: this.damage,
            forceVector: this.getForceVector(),
            hitPoint: [grenadeObj.x, grenadeObj.y]
          });
          
          // Уничтожаем гранату
          this.destroy();
        }
      );
    }
    
    // Активируем проектиль
    this.activate();
    
    return this;
  }
  
  public activate(): void {
    this.isActivated = true;
  }

  public onHit(): void {
    this.destroy();
  }

  public getActivated(): boolean {
    return this.isActivated;
  }

  public getType(): ProjectileType {
    return this.options.type;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getDamage(): number {
    return this.damage;
  }

  public destroy () {
    if (this.gameObject) {
      this.gameObject.destroy();
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

  /**
   * Создает визуальный эффект взрыва
   */
  private createExplosionEffect(): void {
    if (!this.gameObject || !this.scene) return;
    
    // Проверяем наличие текстуры
    if (!this.scene.textures.exists('particle')) {
        // Создаем текстуру частицы на лету, если её нет
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }
    
    // Создаем частицы для эффекта взрыва
    const particles = this.scene.add.particles(0, 0, 'particle', {
        speed: { min: 50, max: 200 },
        scale: { start: 0.5, end: 0 },
        lifespan: 500,
        blendMode: 'ADD',
        emitting: false
    });
    
    // Позиционируем эмиттер на месте гранаты
    particles.setPosition(this.gameObject.x, this.gameObject.y);
    
    // Запускаем взрыв
    particles.explode(30);
    
    // Удаляем эмиттер через некоторое время
    this.scene.time.delayedCall(1000, () => {
        particles.destroy();
    });
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