import * as Phaser from 'phaser';
import { SceneKeys, PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../../core/Constants';
import { Player } from '../../entities/Player';
import { WaveInfo } from '../../core/WaveInfo';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { LocationManager } from '../../core/LocationManager';
import { BaseLocation } from '../../core/BaseLocation';
import { WeaponStatus } from '../../ui/WeaponStatus';
import { BaseShop } from '../../core/BaseShop';
import { SquirrelEnemy } from '../../entities/squireel/SquirrelEnemy';
import { ProjectileController } from '../../core/controllers/ProjectileController';
import { BaseProjectile } from '../../core/BaseProjectile';
import { BloodController, BloodEvents } from '../../core/controllers/BloodController';
import { DecalController } from '../../core/controllers/DecalController';
import { WeaponMine } from '../../weapons/mine/WeaponMine';
import { Grenade } from '../../weapons/grenade/Grenade';
import { Glock } from '../../weapons/glock/Glock';
import { MP5 } from '../../weapons/MP5/MP5';
import { Sawed } from '../../weapons/sawed/Sawed';
import { Weapon } from '../../core/controllers/WeaponController';
import { DamageableEntity } from '../../core/entities/DamageableEntity';
import { createShellCasingTexture, ShellCasingEvents } from '../../core/entities/ShellCasingEntity';
import { DecalEventPayload } from '../../core/types/decals';
import { WeaponAWP } from '../../weapons/AWP/WeaponAWP';
import { ExplosionEntity } from '../../core/entities/ExplosionEntity';
import { RabbitEnemy } from '../../entities/rabbit/RabbitEntity';
import { WaveController, WaveEvents } from '../../core/controllers/WaveController';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  locationId: string;
}

export class GameplayScene extends Phaser.Scene {
  private locationManager!: LocationManager;

  private location!: BaseLocation;
  
  private player!: Player;
  private shop!: BaseShop;
  private enemies: Set<DamageableEntity> = new Set();
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private damageableObjects: Set<DamageableEntity> = new Set();

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  private decalController!: DecalController;
  private projectileController!: ProjectileController;
  private waveController!: WaveController;

  private changeWeaponKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: SceneKeys.GAMEPLAY
    });
  }
  
  init({ locationId } : GameplaySceneData) {
    this.locationManager = new LocationManager(this);
    this.location = this.locationManager.loadLocation(locationId);
  }

  async preload(): Promise<void> {
    this.location.preload();

    Player.preload(this);

    // Создаем текстуру гильзы программно
    createShellCasingTexture(this);
    BloodController.preload(this);

    SquirrelEnemy.preload(this);
    RabbitEnemy.preload(this);
    // TestEnemy.preload(this);

    Glock.preload(this);
    MP5.preload(this);
    Grenade.preload(this);
    Sawed.preload(this);
    WeaponMine.preload(this);
    WeaponAWP.preload(this);
    ExplosionEntity.preload(this);
  }
  
  async create(): Promise<void> {
    logger.info('create');
    // this.physics.world.debugGraphic.visible = true;

    this.decalController = new DecalController(this, 0, 0, settings.display.width, settings.display.height);
    this.decalController.setDepth(5);

    this.changeWeaponKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G);

    // Устанавливаем границы мира
    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);
    
    // Создаем информацию о волне
    this.waveInfo = new WaveInfo(this);
    
    // Создаем интерфейс отображения состояния оружия
    this.weaponStatus = new WeaponStatus(this);

    // Инициализируем группу для гильз
    this.shellCasings = this.physics.add.group();
    
    // Инициализируем менеджер попаданий
    this.projectileController = new ProjectileController(this, this.damageableObjects);

    // Создаем локацию
    this.location.create();

    // Создаем игрока
    this.player = new Player(this, PLAYER_POSITION_X, PLAYER_POSITION_Y);

    this.player.setWeapon(Weapon.MP5);
    this.player.setLocationBounds(this.location.bounds);
    
    // Устанавливаем оружие в интерфейс
    this.weaponStatus.setWeapon(this.player.getWeapon());
    
    // Настраиваем коллизии между игроком и врагами
    // this.physics.add.overlap(
    //   this.player.getSprite(),
    //   this.enemies,
    //   this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );

    this.waveController = new WaveController(this, [
      {
        delay: 1000,
        spawns: [
          {
            delay: 1000,
            entity: RabbitEnemy,
            position: [settings.display.width - 50, 400],
            options: {
              moveX: -1,
              moveY: 0,
              direction: -1,
            },
          },
        ],
      }
    ]);

    this.waveController.start();

    if (settings.gameplay.blood.decals) {
      this.events.on(BloodEvents.bloodParticleDecal, (payload: DecalEventPayload) => this.handleDrowDecal(payload));
    }

    if (settings.gameplay.shellCasings.decals) {
      this.events.on(ShellCasingEvents.shellCasingParticleDecal, (payload: DecalEventPayload) => this.handleDrowDecal(payload));
    }

    this.events.on(WaveEvents.spawnEnemy, (payload: DamageableEntity) => this.handleSpawnEnemy(payload));
  }

  private handleDrowDecal(payload: DecalEventPayload): void {
    this.decalController.drawParticle(payload.particle, payload.x, payload.y);
  }

  private handleSpawnEnemy(payload: DamageableEntity): void {
    this.enemies.add(payload);
    this.damageableObjects.add(payload);
  }

  /**
   * Добавляет интерактивный объект в группу объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для добавления в группу
   */
  public addDamageableObject(object: DamageableEntity): void {
    this.damageableObjects.add(object);
  }

  public addShop(shop: BaseShop): void {
    this.shop = shop;
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
      const playerPosition = this.player.getPosition();
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.shop.x, this.shop.y,
        playerPosition[0], playerPosition[1]
      );

      if (distanceToPlayer <= this.shop.getInteractionRadius()) {
        this.shop.setPlayerNearby(true);
      } else {
        this.shop.setPlayerNearby(false);
      }

      this.shop.update(time, delta);
    }
  
    // Обновляем всех врагов
    this.enemies.forEach(enemy => {
      // if (enemy.getDestroyed()) {
      //   this.enemies.delete(enemy);
      // } else {
        enemy.update(time, delta);
      // }
    });

    if (this.changeWeaponKey.isDown) {
      this.player.setWeapon(Weapon.GRENADE);
    }

    // Обрабатываем попадания пуль
    this.projectileController.update(time, delta);
  }
  
  // Метод для доступа к группе гильз
  public getShellCasingsGroup(): Phaser.Physics.Arcade.Group {
    return this.shellCasings;
  }
  
  // private handlePlayerEnemyCollision(
  //   playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody, 
  //   enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  // ): void {
  //   // Проверяем, что enemyObj - это спрайт
  //   if (!(enemyObj instanceof Phaser.Physics.Arcade.Sprite)) {
  //     return;
  //   }
    
  //   // Проверяем, что playerObj - это спрайт
  //   if (!(playerObj instanceof Phaser.Physics.Arcade.Sprite)) {
  //     return;
  //   }
    
  //   // Получаем объект врага из свойства данных спрайта
  //   const enemy = enemyObj.getData('enemyRef') as BaseEnemy;
  //   if (!enemy) {
  //     console.error('Спрайт врага не содержит ссылку на объект BaseEnemy');
  //     return;
  //   }
  //   const direction = enemy.getDirection();
  //   const player = playerObj.getData('playerRef') as Player;

  //   if (!player.isJumping) {
  //     player.applyForce(direction, 0, 10, 0.5, 0.1);  
  //   }
  // }

  public addProjectile(projectile: BaseProjectile): void {
    this.projectileController.addProjectile(projectile);
  }
} 