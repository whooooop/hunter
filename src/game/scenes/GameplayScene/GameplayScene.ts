import * as Phaser from 'phaser';
import { SceneKeys, PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../../core/Constants';
import { Player } from '../../entities/Player';
import { BaseEnemy } from '../../core/BaseEnemy';
import { WaveInfo } from '../../core/WaveInfo';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { createShellCasingTexture } from '../../utils/ShellCasingTexture';
import { LocationManager } from '../../core/LocationManager';
import { BaseLocation } from '../../core/BaseLocation';
import { WeaponManager } from '../../core/WeaponManager';
import { LocationObject } from '../../core/LocationObject';
import { WeaponStatus } from '../../ui/WeaponStatus';
import { BaseShop } from '../../core/BaseShop';
import { SquirrelEnemy } from '../../entities/squireel/SquirrelEnemy';
import { DecalManager } from '../../core/DecalManager';
import { ProjectileManager } from '../../core/ProjectileManager';
import { BaseProjectile } from '../../core/BaseProjectile';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  locationId: string;
}

export class GameplayScene extends Phaser.Scene {
  private locationManager!: LocationManager;
  private weaponManager!: WeaponManager;

  private location!: BaseLocation;
  
  private player!: Player;
  private shop!: BaseShop;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private interactiveObjects!: Phaser.Physics.Arcade.Group; // Группа для объектов, взаимодействующих с пулями
  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  private decalManager!: DecalManager;
  private projectileManager!: ProjectileManager;
  
  constructor() {
    super({ key: SceneKeys.GAMEPLAY });
  }
  
  init({ locationId } : GameplaySceneData) {
    this.locationManager = new LocationManager(this);
    this.weaponManager = new WeaponManager(this);
    this.location = this.locationManager.loadLocation(locationId);
  }

  async preload(): Promise<void> {
    this.location.preload();
    
    // Создаем текстуру гильзы программно
    createShellCasingTexture(this);

    WeaponManager.preload(this);
  }
  
  async create(): Promise<void> {
    logger.info('create');

    // Устанавливаем границы мира
    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);
    
    this.decalManager = new DecalManager(this, 0, 0,settings.display.width, settings.display.height);
    this.decalManager.setDepth(5); // Устанавливаем ниже, чем у активных объектов
    
    // Создаем информацию о волне
    this.waveInfo = new WaveInfo(this);
    
    // Создаем интерфейс отображения состояния оружия
    this.weaponStatus = new WeaponStatus(this);

    // Инициализируем группы врагов и пуль
    // this.bullets = this.physics.add.group({
    //   classType: BaseBullet,
    //   runChildUpdate: true,
    //   allowGravity: false
    // });

    // Инициализируем группу для гильз
    this.shellCasings = this.physics.add.group({
      bounceX: settings.gameplay.shellCasings.bounce,
      bounceY: settings.gameplay.shellCasings.bounce,
      collideWorldBounds: true,
      runChildUpdate: true,
      dragX: settings.gameplay.shellCasings.dragX,
      dragY: 0,
      gravityY: settings.gameplay.shellCasings.gravity
    });
    
    // Инициализируем группу для интерактивных объектов
    this.interactiveObjects = this.physics.add.group({
      classType: LocationObject,
      runChildUpdate: true,
      allowGravity: false
    });

    this.enemies = this.physics.add.group({
      classType: BaseEnemy,
      runChildUpdate: true,
      allowGravity: false
    });
    
    // Инициализируем менеджер попаданий
    this.projectileManager = new ProjectileManager(this, this.decalManager, this.enemies);

    // Создаем локацию
    this.location.create();

    // Создаем игрока
    this.player = new Player(this, PLAYER_POSITION_X, PLAYER_POSITION_Y);
    const weapon = this.weaponManager.getWeapon('grenade');
    this.player.setWeapon(weapon);
    this.player.setLocationBounds(this.location.bounds);
    
    // Устанавливаем оружие в интерфейс
    this.weaponStatus.setWeapon(weapon);
    
    // Настраиваем коллизии между игроком и врагами
    this.physics.add.overlap(
      this.player.getSprite(),
      this.enemies,
      this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.spawnEnemy();
  }

  /**
   * Добавляет интерактивный объект в группу объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для добавления в группу
   */
  public addInteractiveObject(object: Phaser.Physics.Arcade.Sprite): void {
    this.interactiveObjects.add(object);
  }

  public addShop(shop: BaseShop): void {
    this.shop = shop;
  }

  /**
   * Удаляет интерактивный объект из группы объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для удаления из группы
   * @param destroy Флаг, указывающий, нужно ли уничтожить объект
   */
  public removeInteractiveObject(object: Phaser.GameObjects.Sprite, destroy: boolean = false): void {
    if (this.interactiveObjects.contains(object)) {
      this.interactiveObjects.remove(object, destroy);
    }
  }

  /**
   * Добавляет созданную гильзу в группу гильз
   * @param shell Спрайт гильзы для добавления в группу
   */
  public addShellCasing(shell: Phaser.Physics.Arcade.Sprite): void {
    this.shellCasings.add(shell);
  }
  
  update(time: number, delta: number): void {
    this.location.update(time, delta);
    
    // Обновляем игрока
    if (this.player) {
      this.player.update(time, delta);
      
      // Обновляем состояние оружия в интерфейсе
      const weapon = this.player.getWeapon();
      if (weapon) {
        this.weaponStatus.setAmmo(weapon.getCurrentAmmo(), 12); // Хардкод для размера магазина
      }
    }

    if (this.shop && this.player) {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.shop.x, this.shop.y,
        this.player.x, this.player.y
      );

      if (distanceToPlayer <= this.shop.getInteractionRadius()) {
        this.shop.setPlayerNearby(true);
      } else {
        this.shop.setPlayerNearby(false);
      }
      
      this.shop.update(time, delta);
    }
  
    // Обновляем всех врагов
    this.enemies.getChildren().forEach(enemySprite => {
      const enemy = (enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemyRef');
      if (enemy && typeof enemy.update === 'function') {
        enemy.update(time, delta);
      }
    });

    // Обрабатываем попадания пуль
    this.projectileManager.update(time, delta);
  }
  
  // Метод для доступа к группе пуль
  public getBulletsGroup(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
  
  // Метод для доступа к группе гильз
  public getShellCasingsGroup(): Phaser.Physics.Arcade.Group {
    return this.shellCasings;
  }
  
  // Метод для доступа к группе врагов
  public getEnemiesGroup(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }
  
  // Метод для доступа к группе интерактивных объектов
  public getInteractiveObjectsGroup(): Phaser.Physics.Arcade.Group {
    return this.interactiveObjects;
  }
  
  private spawnEnemy(): void {
    const x = settings.display.width - 50;
    const y = 400;
    
    const enemy = new SquirrelEnemy(this, x, y, {
      health: 1000,
      moveX: -1,
      moveY: 0,
      direction: -1,
      decalManager: this.decalManager
    });
    this.enemies.add(enemy.getSprite());
  }
  
  private handlePlayerEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody, 
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    // Проверяем, что enemyObj - это спрайт
    if (!(enemyObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    // Проверяем, что playerObj - это спрайт
    if (!(playerObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    // Получаем объект врага из свойства данных спрайта
    const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
    if (!enemy) {
      console.error('Спрайт врага не содержит ссылку на объект BaseEnemy');
      return;
    }
    const direction = enemy.getDirection();
    const player = playerObj.getData('playerRef') as Player;

    if (!player.isJumping) {
      player.applyForce(direction, 0, 10, 0.5, 0.1);  
    }
  }

  public addProjectile(projectile: BaseProjectile): void {
    this.projectileManager.addProjectile(projectile);
  }
} 