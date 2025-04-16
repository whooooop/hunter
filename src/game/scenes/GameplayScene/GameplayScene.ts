import * as Phaser from 'phaser';
import { SceneKeys, PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../../core/Constants';
import { Player } from '../../entities/Player';
import { WaveInfo } from '../../ui/WaveInfo';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { LocationManager } from '../../core/LocationManager';
import { BaseLocation } from '../../core/BaseLocation';
import { WeaponStatus } from '../../ui/WeaponStatus';
import { BaseShop } from '../../core/BaseShop';
import { SquirrelEnemy } from '../../enemies/squireel/SquirrelEnemy';
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
import { RabbitEnemy } from '../../enemies/rabbit/RabbitEntity';
import { WaveController } from '../../core/controllers/WaveController';
import { createWavesConfig } from '../../levels/test/wavesConfig'
import { EnemyEntity, EnemyEntityEvents } from '../../core/entities/EnemyEntity';
import { WaveStartEventPayload, WaveEvents } from '../../core/controllers/WaveController';
import { generateId } from '../../../utils/stringGenerator';
import { WeaponEvents, WeaponFireEventsPayload } from '../../core/entities/WeaponEntity';
import { onEvent } from '../../core/Events';
import { EnemyType } from '../../enemies';
import { preloadEnemies } from '../../enemies';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  locationId: string;
}

export class GameplayScene extends Phaser.Scene {
  private locationManager!: LocationManager;

  private location!: BaseLocation;
  
  private shop!: BaseShop;
  private enemies: Set<DamageableEntity> = new Set();
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private damageableObjects: Set<DamageableEntity> = new Set();

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private decalController!: DecalController;
  private projectileController!: ProjectileController;
  private waveController!: WaveController;

  private changeWeaponKey!: Phaser.Input.Keyboard.Key;

  private mainPlayer!: Player;
  private players: Set<Player> = new Set();

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

    preloadEnemies(this, [EnemyType.RABBIT, EnemyType.SQUIRREL]);
    
    // Создаем текстуру гильзы программно
    createShellCasingTexture(this);
    BloodController.preload(this);

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

    this.createPlayer(PLAYER_POSITION_X, PLAYER_POSITION_Y, true);
    this.createPlayer(PLAYER_POSITION_X + 50, PLAYER_POSITION_Y + 200);
    
    // Настраиваем коллизии между игроком и врагами
    // this.physics.add.overlap(
    //   this.player.getSprite(),
    //   this.enemies,
    //   this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );

    this.waveController = new WaveController(this, createWavesConfig());
    this.waveController.start();

    if (settings.gameplay.blood.decals) {
      onEvent(this, BloodEvents.bloodParticleDecal, (payload: DecalEventPayload) => this.handleDrowDecal(payload));
    }

    if (settings.gameplay.shellCasings.decals) {
      onEvent(this, ShellCasingEvents.shellCasingParticleDecal, (payload: DecalEventPayload) => this.handleDrowDecal(payload));
    }

    onEvent(this, WeaponEvents.FireEvent, (payload: WeaponFireEventsPayload) => this.handleFireProjectile(payload));
    onEvent(this, WaveEvents.WaveStartEvent, (payload: WaveStartEventPayload) => this.handleWaveStart(payload));
    onEvent(this, WaveEvents.SpawnEnemyEvent, (payload: DamageableEntity) => this.handleSpawnEnemy(payload));
    onEvent(this, EnemyEntityEvents.enemyDeath, (payload: DecalEventPayload) => this.handleDrowDecal(payload));
  }

  private handleFireProjectile({ projectile }: WeaponFireEventsPayload): void {
    console.log('WeaponEvents.FireEvent', projectile);
    this.projectileController.addProjectile(projectile);
  }

  private handleDrowDecal(payload: DecalEventPayload): void {
    this.decalController.drawParticle(payload.particle, payload.x, payload.y);
  }

  private handleSpawnEnemy(payload: DamageableEntity): void {
    this.enemies.add(payload);
    this.damageableObjects.add(payload);
  }

  private handleWaveStart(payload: WaveStartEventPayload) {
    this.waveInfo.start(payload)
  }

  private createPlayer(x: number, y: number, isMain: boolean = false): void {
    const player = new Player(this, generateId(), x, y);
    player.setWeapon(Weapon.GLOCK);
    player.setLocationBounds(this.location.bounds);

    if (isMain) {
      this.mainPlayer = player;
    }

    this.players.add(player);
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

    this.players.forEach(player => {
      player.update(time, delta);
    });

    // Обновляем игрока
    if (this.mainPlayer) {
      // Обновляем состояние оружия в интерфейсе
      const weapon = this.mainPlayer.getWeapon();
      if (weapon) {
        this.weaponStatus.setAmmo(weapon.getCurrentAmmo(), 12); // Хардкод для размера магазина
      }
    }

    if (this.shop && this.mainPlayer) {
      const playerPosition = this.mainPlayer.getPosition();
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
      this.mainPlayer.setWeapon(Weapon.GRENADE);
    }

    // Обрабатываем попадания пуль
    this.projectileController.update(time, delta);
    this.waveInfo.update(time, delta);
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
} 