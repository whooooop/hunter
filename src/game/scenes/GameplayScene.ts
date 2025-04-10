import * as Phaser from 'phaser';
import { SceneKeys, PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../core/Constants';
import { Player } from '../entities/Player';
import { BaseEnemy } from '../entities/BaseEnemy';
import { SquirrelEnemy } from '../entities/SquirrelEnemy';
import { BaseBullet } from '../weapons/BaseBullet';
import { WaveInfo } from '../core/WaveInfo';
import { settings } from '../settings';
import { createLogger } from '../../utils/logger';
import { createShellCasingTexture } from '../utils/ShellCasingTexture';
import { LocationManager } from '../core/LocationManager';
import { BaseLocation } from '../core/BaseLocation';
import { WeaponManager } from '../core/WeaponManager';
import { LocationObject } from '../core/LocationObject';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  locationId: string;
}

export class GameplayScene extends Phaser.Scene {
  private locationManager!: LocationManager;
  private weaponManager!: WeaponManager;

  private location!: BaseLocation;
  
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private interactiveObjects!: Phaser.Physics.Arcade.Group; // Группа для объектов, взаимодействующих с пулями
  private waveInfo!: WaveInfo;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  
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

    this.weaponManager.preload();
  }
  
  async create(): Promise<void> {
    logger.info('create');

    // Устанавливаем границы мира
    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);
    
    // Создаем информацию о волне
    this.waveInfo = new WaveInfo(this);
    
    // Инициализируем группы врагов и пуль
    this.bullets = this.physics.add.group({
      classType: BaseBullet,
      runChildUpdate: true,
      allowGravity: false
    });
    
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
    
    // Создаем локацию
    this.location.create();

    // Создаем игрока
    this.player = new Player(this, PLAYER_POSITION_X, PLAYER_POSITION_Y);

    this.player.setWeapon(this.weaponManager.getWeapon('pistol'));
    
    // Настраиваем коллизии между пулями и врагами
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.handleBulletEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    // Настраиваем коллизии между игроком и врагами
    this.physics.add.overlap(
      this.player.getSprite(),
      this.enemies,
      this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    // Настраиваем коллизии между пулями и интерактивными объектами
    this.physics.add.overlap(
      this.bullets,
      this.interactiveObjects,
      this.handleBulletObjectCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  /**
   * Добавляет интерактивный объект в группу объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для добавления в группу
   */
  public addInteractiveObject(object: Phaser.Physics.Arcade.Sprite): void {
    this.interactiveObjects.add(object);
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
    this.location.update(time);
    
    // Обновляем игрока
    if (this.player) {
      this.player.update(time, delta);
    }
  
    // Обновляем всех врагов
    // this.enemies.getChildren().forEach(enemySprite => {
    //   const enemy = (enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemyRef');
    //   if (enemy && typeof enemy.update === 'function') {
    //     enemy.update(time, delta);
    //   }
    // });
  }
  
  // Метод для доступа к группе пуль
  public getBulletsGroup(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
  
  // Метод для доступа к группе гильз
  public getShellCasingsGroup(): Phaser.Physics.Arcade.Group {
    return this.shellCasings;
  }
  
  // Очистка всех гильз со сцены
  public clearAllShellCasings(): void {
    this.shellCasings.clear(true, true);
  }
  
  // private spawnEnemy(): void {
  //   // Создаем врага в видимой части экрана для отладки
  //   // вместо за правой границей экрана
  //   const x = settings.display.width / 1.5; // Примерно 2/3 экрана справа
  //   const y = Phaser.Math.Between(50, settings.display.height - 50);
    
  //   const enemy = new SquirrelEnemy(this, x, y);
  //   this.enemies.add(enemy.getSprite());
  // }
  
  /**
   * Обработчик столкновения пули с интерактивным объектом
   */
  private handleBulletObjectCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
    locationObject: LocationObject
  ): void {
    // Проверяем, что bulletObj это спрайт
    if (!(bulletObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    // Получаем объект пули из свойства данных спрайта
    const bullet = bulletObj.getData('bulletRef') as BaseBullet;

    locationObject.takeDamage(bullet.getDamage());

    if (locationObject.isDestroyed) {
      // this.removeInteractiveObject(locationObject, true);
    }
    // bullet.onHit();
  }
  
  private handleBulletEnemyCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    // Проверяем, что bulletObj это спрайт (а не тайл)
    if (!(bulletObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    // Получаем объект пули из свойства данных спрайта
    const bullet = bulletObj.getData('bulletRef') as BaseBullet;
    if (!bullet) {
      console.error('Спрайт пули не содержит ссылку на объект BaseBullet');
      return;
    }
    
    // Проверяем, что enemyObj валидный
    if (!(enemyObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
    if (!enemy) {
      console.error('Спрайт врага не содержит ссылку на объект BaseEnemy');
      return;
    }
    
    // Наносим урон врагу
    enemy.takeDamage(bullet.getDamage());
    
    // Деактивируем пулю
    bullet.onHit();
  }
  
  private handlePlayerEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    // Проверяем, что enemyObj - это спрайт
    if (!(enemyObj instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
    
    // Получаем объект врага из свойства данных спрайта
    const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
    if (!enemy) {
      console.error('Спрайт врага не содержит ссылку на объект BaseEnemy');
      return;
    }
  }

} 