import * as Phaser from 'phaser';
import { PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../../core/Constants';
import { SceneKeys } from '../index';
import { Player } from '../../entities/Player';
import { WaveInfo } from '../../ui/WaveInfo';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { LocationManager } from '../../core/LocationManager';
import { BaseLocation } from '../../core/BaseLocation';
import { WeaponStatus } from '../../ui/WeaponStatus';
import { BaseShop } from '../../core/BaseShop';
import { ProjectileController } from '../../core/controllers/ProjectileController';
import { BloodController, BloodEvents } from '../../core/controllers/BloodController';
import { DecalController } from '../../core/controllers/DecalController';
import { DamageableEntity } from '../../core/entities/DamageableEntity';
import { createShellCasingTexture, ShellCasingEvents } from '../../core/entities/ShellCasingEntity';
import { DecalEventPayload } from '../../core/types/decals';
import { SpawnEnemyPayload, WaveController } from '../../core/controllers/WaveController';
import { createWavesConfig } from '../../levels/test/wavesConfig'
import { WaveStartEventPayload, WaveEvents } from '../../core/controllers/WaveController';
import { generateId } from '../../../utils/stringGenerator';
import { onEvent } from '../../core/Events';
import { preloadWeapons } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { preloadProjectiles } from '../../projectiles';
import { WeaponFireEventsPayload } from '../../core/types/weaponTypes';
import { WeaponEvents } from '../../core/types/weaponTypes';
import { EnemyEntityEvents, EnemyDeathPayload } from '../../core/types/enemyTypes';
import { ScoreController } from '../../core/controllers/ScoreController';
import { ScoreEvents, UpdateScoreEventPayload } from '../../core/types/scoreTypes';
import { WeaponController } from '../../core/controllers/WeaponController';
import { PlayerEvents, PlayerSetWeaponEventPayload } from '../../core/types/playerTypes';
import { testLevel } from '../../levels/test';
import { ShopController } from '../../core/controllers/ShopController';
import { WeaponPurchasedPayload } from '../../core/types/shopTypes';
import { ShopEvents } from '../../core/types/shopTypes';
import { MultiplayerController } from '../../core/controllers/MultiplayerController';
import { createEnemy } from '../../enemies';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  locationId: string;
}

export class GameplayScene extends Phaser.Scene {
  private locationManager!: LocationManager;

  private location!: BaseLocation;
  
  private shop!: BaseShop;
  private enemies: Map<string, DamageableEntity> = new Map();
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private damageableObjects: Map<string, DamageableEntity> = new Map();

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private decalController!: DecalController;
  private projectileController!: ProjectileController;
  private waveController!: WaveController;
  private scoreController!: ScoreController;
  private weaponController!: WeaponController;
  private shopController!: ShopController;
  private multiplayerController!: MultiplayerController;
  private changeWeaponKey!: Phaser.Input.Keyboard.Key;

  private mainPlayerId!: string;
  private players: Map<string, Player> = new Map();

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

    WaveController.preloadEnemies(this, testLevel.waves);
    preloadWeapons(this);
    preloadProjectiles(this);

    // Создаем текстуру гильзы программно
    createShellCasingTexture(this);
    BloodController.preload(this);
  }
  
  async create(): Promise<void> {
    this.location.create();

    this.scoreController = new ScoreController(this);
    this.weaponController = new WeaponController(this, this.players);
    this.shopController = new ShopController(this, this.players, this.shop, testLevel.weapons);
    this.decalController = new DecalController(this, 0, 0, settings.display.width, settings.display.height);
    this.decalController.setDepth(5);

    this.multiplayerController = new MultiplayerController(this);

    // Устанавливаем границы мира
    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);
    
    this.waveInfo = new WaveInfo(this);
    this.weaponStatus = new WeaponStatus(this);

    // Инициализируем группу для гильз
    this.shellCasings = this.physics.add.group();
    
    // Инициализируем менеджер попаданий
    this.projectileController = new ProjectileController(this, this.damageableObjects, {
      simulate: false,
    });

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
    onEvent(this, WaveEvents.SpawnEnemyEvent, (payload: SpawnEnemyPayload) => this.handleSpawnEnemy(payload));
    onEvent(this, EnemyEntityEvents.enemyDeath, (payload: EnemyDeathPayload) => this.handleEnemyDeath(payload));
    onEvent(this, ScoreEvents.UpdateScoreEvent, (payload: UpdateScoreEventPayload) => this.handleUpdateScore(payload));
    onEvent(this, PlayerEvents.PlayerSetWeaponEvent, (payload: PlayerSetWeaponEventPayload) => this.handleSetWeapon(payload));
    onEvent(this, ShopEvents.WeaponPurchasedEvent, (payload: WeaponPurchasedPayload) => this.handleWeaponPurchased(payload));

    this.createPlayer(PLAYER_POSITION_X, PLAYER_POSITION_Y, true);
    // this.createPlayer(PLAYER_POSITION_X + 50, PLAYER_POSITION_Y + 200);
    
    // Настраиваем коллизии между игроком и врагами
    // this.physics.add.overlap(
    //   this.player.getSprite(),
    //   this.enemies,
    //   this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );
    this.multiplayerController.init();
  }

  private handleFireProjectile(payload: WeaponFireEventsPayload): void {
    this.projectileController.addProjectile(payload);
  }

  private handleDrowDecal(payload: DecalEventPayload): void {
    this.decalController.drawParticle(payload.particle, payload.x, payload.y);
  }

  private handleEnemyDeath({ id }: EnemyDeathPayload): void {
    const enemy = this.enemies.get(id)!;
    const gameObject = enemy.getGameObject();
    this.enemies.delete(id);
    this.damageableObjects.delete(id);
    this.decalController.drawParticle(gameObject, gameObject.x, gameObject.y);
  }

  private handleSpawnEnemy({ id, enemyType, position, options }: SpawnEnemyPayload): void {
    const enemy = createEnemy(id, enemyType, this, position.x, position.y, options);
    this.enemies.set(id, enemy);
    this.damageableObjects.set(id, enemy);
  }

  private handleWaveStart(payload: WaveStartEventPayload) {
    this.waveInfo.start(payload)
  }

  private handleUpdateScore(payload: UpdateScoreEventPayload): void {
    if (payload.playerId === this.mainPlayerId) {
      this.weaponStatus.setCoins(payload.score);
    }
  }

  private handleWeaponPurchased(payload: WeaponPurchasedPayload): void {
    this.weaponController.setWeapon(payload.playerId, payload.weaponType);
  }

  private handleSetWeapon(payload: PlayerSetWeaponEventPayload): void {
    if (payload.playerId === this.mainPlayerId) {
      this.weaponStatus.setWeapon(payload);
    }
  }

  private createPlayer(x: number, y: number, isMain: boolean = false): void {
    const playerId = generateId();
    const player = new Player(this, playerId, x, y);

    if (isMain) {
      this.mainPlayerId = playerId;
      this.shopController.setInteractablePlayerId(playerId);
    }

    this.players.set(playerId, player);
    this.weaponController.setWeapon(playerId, WeaponType.GLOCK);

    player.setLocationBounds(this.location.bounds);
  }

  /**
   * Добавляет интерактивный объект в группу объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для добавления в группу
   */
  public addDamageableObject(id: string, object: DamageableEntity): void {
    this.damageableObjects.set(id, object);
  }

  public addShop(shop: BaseShop): void {
    this.shop = shop;
  }
  
  update(time: number, delta: number): void {
    this.location.update(time, delta);
    this.shopController.update(time, delta);
    this.players.forEach(player => {
      player.update(time, delta);
    });

    // Обновляем игрока
    if (this.mainPlayerId) {
      // Обновляем состояние оружия в интерфейсе
      const weapon = this.players.get(this.mainPlayerId)!.getWeapon();
      if (weapon) {
        this.weaponStatus.setAmmo(weapon.getCurrentAmmo(), weapon.getMaxAmmo());
      }
    }
  
    // Обновляем всех врагов
    this.enemies.forEach(enemy => {
      // if (enemy.getDestroyed()) {
      //   this.enemies.delete(enemy);
      // } else {
        enemy.update(time, delta);
      // }
    });

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