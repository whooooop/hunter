import * as Phaser from 'phaser';
import { PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../../core/Constants';
import { SceneKeys } from '../index';
import { PlayerEntity } from '../../core/entities/PlayerEntity';
import { WaveInfo } from '../../ui/WaveInfo';
import { settings } from '../../settings';
import { createLogger } from '../../../utils/logger';
import { WeaponStatus } from '../../ui/WeaponStatus';
import { BaseShop } from '../../core/BaseShop';
import { ProjectileController } from '../../core/controllers/ProjectileController';
import { BloodController } from '../../core/controllers/BloodController';
import { DecalController } from '../../core/controllers/DecalController';
import { SpawnEnemyPayload, WaveController } from '../../core/controllers/WaveController';
import { createWavesConfig } from '../../levels/test/wavesConfig'
import { WaveStartEventPayload, WaveEvents } from '../../core/controllers/WaveController';
import { generateId } from '../../../utils/stringGenerator';
import { emitEvent, offEvent, onEvent } from '../../core/Events';
import { preloadWeapons } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { preloadProjectiles } from '../../projectiles';
import { Enemy } from '../../core/types/enemyTypes';
import { ScoreController } from '../../core/controllers/ScoreController';
import { ScoreEvents, UpdateScoreEventPayload } from '../../core/types/scoreTypes';
import { WeaponController } from '../../core/controllers/WeaponController';
import { testLevel } from '../../levels/test';
import { ShopController } from '../../core/controllers/ShopController';
import { ShopEvents } from '../../core/types/shopTypes';
import { MultiplayerController } from '../../core/controllers/MultiplayerController';
import { createEnemy } from '../../enemies';
import { KeyBoardController } from '../../core/controllers/KeyBoardController';
import { Player } from '../../core/types/playerTypes';
import { Game } from '../../core/types/gameTypes';
import { Damageable } from '../../core/types/damageableTypes';
import { preloadFx } from '../../fx';
import { Location } from '../../core/types/Location';
import { getLocation } from '../../locations';
import { LoadingView } from '../../views/loading/LoadingView';
import { getLevel, LevelId } from '../../levels';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  levelId: LevelId;
}

export class GameplayScene extends Phaser.Scene {
  private location!: Location.BaseClass;

  private loadingView!: LoadingView;
  
  private shop!: BaseShop;
  private enemies: Map<string, Damageable.Entity> = new Map();
  private damageableObjects: Map<string, Damageable.Entity> = new Map();

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private decalController!: DecalController;
  private projectileController!: ProjectileController;
  private waveController!: WaveController;
  private scoreController!: ScoreController;
  private weaponController!: WeaponController;
  private shopController!: ShopController;
  private multiplayerController!: MultiplayerController;
  private keyboardController!: KeyBoardController;
  private changeWeaponKey!: Phaser.Input.Keyboard.Key;

  private mainPlayerId!: string;
  private players: Map<string, PlayerEntity> = new Map();
  private lastSentState: number = 0;
  private lastStateHash: string = '';

  constructor() {
    super({
      key: SceneKeys.GAMEPLAY
    });
  }
  
  init({ levelId } : GameplaySceneData) {
    this.loadingView = new LoadingView(this);
    const level = getLevel(levelId);
    this.location = getLocation(this, level.location);
  }

  async preload(): Promise<void> {
    this.location.preload();

    PlayerEntity.preload(this);
    BloodController.preload(this);
    WaveController.preloadEnemies(this, testLevel.waves);

    preloadWeapons(this);
    preloadProjectiles(this);
    preloadFx(this);
  }
  
  async create(): Promise<void> {
    const playerId = window.location.search.split('player=')[1] || generateId();
    this.mainPlayerId = playerId;

    onEvent(this, WaveEvents.WaveStartEvent, (payload: WaveStartEventPayload) => this.handleWaveStart(payload));
    onEvent(this, WaveEvents.SpawnEnemyEvent, (payload: SpawnEnemyPayload) => this.handleSpawnEnemy(payload));
    onEvent(this, Enemy.Events.Death.Local, (payload: Enemy.Events.Death.Payload) => this.handleEnemyDeath(payload));
    onEvent(this, ScoreEvents.UpdateScoreEvent, (payload: UpdateScoreEventPayload) => this.handleUpdateScore(payload));

    this.location.create();

    this.scoreController = new ScoreController(this);
    this.keyboardController = new KeyBoardController(this, this.players, playerId);
    this.weaponController = new WeaponController(this, this.players);
    this.shopController = new ShopController(this, this.players, playerId, this.shop, testLevel.weapons);
    this.decalController = new DecalController(this, 0, 0, settings.display.width, settings.display.height, 5);
    this.projectileController = new ProjectileController(this, this.damageableObjects);
    this.waveController = new WaveController(this, createWavesConfig());

    this.waveInfo = new WaveInfo(this);
    this.weaponStatus = new WeaponStatus(this);

    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);

    this.shopController.setInteractablePlayerId(playerId);

    // this.multiplayerInit(playerId);
    this.singlePlayerInit(playerId);
  }

  private singlePlayerInit(playerId: string): void {
    this.spawnPlayer(playerId, PLAYER_POSITION_X, PLAYER_POSITION_Y);
    this.waveController.start();
    this.projectileController.setSimulate(false);
    emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.GLOCK, price: 0 });
    emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 5000 });
  }

  private multiplayerInit(playerId: string): void {
    onEvent(this, Game.Events.State.Remote, this.handleGameState, this);
    onEvent(this, Player.Events.Join.Remote, this.handlePlayerJoin, this);
    onEvent(this, Player.Events.Left.Remote, this.handlePlayerLeft, this);
    
    this.projectileController.setSimulate(false);

    this.multiplayerController = new MultiplayerController(this);
    this.multiplayerController.connect('GAME1', playerId).then(() => {
      this.waveController.start();
    });
  }

  private handleGameState(payload: Game.Events.State.Payload): void {
    payload.connected.forEach(playerId => {
      const player = payload.playersState.find(p => p.id === playerId);
      if (player) {
        this.spawnPlayer(
          player.id, 
          player.position?.x || PLAYER_POSITION_X, 
          player.position?.y || PLAYER_POSITION_Y
        );
        this.weaponController.setWeaponById({ playerId, weaponId: player.weaponId });
      }
    });
  }

  private handlePlayerJoin({ playerId, playerState }: Player.Events.Join.Payload): void {
    this.spawnPlayer(playerId, playerState?.position?.x!, playerState?.position?.y!);
    this.weaponController.setWeaponById({ playerId, weaponId: playerState?.weaponId! });
  }

  private handlePlayerLeft(payload: Player.Events.Left.Payload): void {
    const player = this.players.get(payload.playerId);
    if (player) {
      player.destroy();
      this.players.delete(payload.playerId);
    }
  }

  private handleEnemyDeath({ id }: Enemy.Events.Death.Payload): void {
    this.enemies.delete(id);
    this.damageableObjects.delete(id);
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

  public spawnPlayer(playerId: string, x: number, y: number): void {
    if (this.players.has(playerId)) {
      logger.warn(`Player ${playerId} already exists.`);
      return;
    }

    const player = new PlayerEntity(this, playerId, x, y);
    this.players.set(playerId, player);

    player.setLocationBounds(this.location.getBounds());
  }

  /**
   * Добавляет интерактивный объект в группу объектов, взаимодействующих с пулями
   * @param object Спрайт объекта для добавления в группу
   */
  public addDamageableObject(id: string, object: Damageable.Entity): void {
    this.damageableObjects.set(id, object);
  }

  public addShop(shop: BaseShop): void {
    this.shop = shop;
  }
  
  update(time: number, delta: number): void {
    const mainPlayer = this.players.get(this.mainPlayerId);

    this.location.update(time, delta);
    this.shopController.update(time, delta);
    this.keyboardController.update(time, delta);

    this.players.forEach(player => {
      player.update(time, delta);
    });

    // Обновляем игрока
    if (mainPlayer) {
      // Обновляем состояние оружия в интерфейсе
      const weapon = mainPlayer.getWeapon();
      if (weapon) {
        this.weaponStatus.setAmmo(weapon.getCurrentAmmo(), weapon.getMaxAmmo());
      }
    }
  
    // Обновляем всех врагов
    this.enemies.forEach(enemy => {
      enemy.update(time, delta);
    });

    // Обрабатываем попадания пуль
    this.projectileController.update(time, delta);
    this.waveInfo.update(time, delta);  

    this.updatePlayerState(time, delta);
  }

  private updatePlayerState(time: number, delta: number): void {
    const player = this.players.get(this.mainPlayerId)!;
    if (!player) {
      return;
    }
    const state = player.getPlayerState();
    const stateHash = (state.position.x + state.position.y).toString();
    if (time - this.lastSentState < 40 || stateHash === this.lastStateHash) {
      return;
    }
    emitEvent(this, Player.Events.State.Local, state);
    this.lastSentState = time;
    this.lastStateHash = stateHash;
  }

  destroy(): void {
    this.location.destroy();
    this.waveController.destroy();
    this.scoreController.destroy();
    this.weaponController.destroy();
    this.shopController.destroy();
    this.decalController.destroy();
    this.projectileController.destroy();
    this.waveInfo.destroy();
    this.weaponStatus.destroy();
    this.players.forEach(player => player.destroy());
    this.players.clear();
    this.enemies.clear();
    this.damageableObjects.clear();
    this.multiplayerController.destroy();
    this.keyboardController.destroy();

    offEvent(this, WaveEvents.WaveStartEvent, this.handleWaveStart, this);
    offEvent(this, WaveEvents.SpawnEnemyEvent, this.handleSpawnEnemy, this);
    offEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    offEvent(this, ScoreEvents.UpdateScoreEvent, this.handleUpdateScore, this);
    offEvent(this, Player.Events.Join.Remote, this.handlePlayerJoin, this);
    offEvent(this, Player.Events.Left.Remote, this.handlePlayerLeft, this);
    offEvent(this, Game.Events.State.Remote, this.handleGameState, this);
  }
} 