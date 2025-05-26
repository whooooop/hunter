import { StorageSpace, SyncCollection, SyncCollectionRecord } from '@hunter/multiplayer/dist/client';
import { ConnectionState, EnemyState, GameState, PlayerWeapon } from '@hunter/storage-proto/dist/storage';
import * as Phaser from 'phaser';
import { BaseShop } from '../../BaseShop';
import { DISPLAY, GAMEOVER, VERSION } from '../../config';
import { BloodController, DecalController, KeyBoardController, MultiplayerController, ProjectileController, QuestController, ScoreController, ShopController, WaveController, WeaponController } from '../../controllers';
import { createEnemy } from '../../enemies';
import { EnemyEntity } from '../../entities/EnemyEntity';
import { PlayerEntity } from '../../entities/PlayerEntity';
import { preloadFx } from '../../fx';
import { emitEvent, offEvent, onEvent } from '../../GameEvents';
import { getLevel, LevelId } from '../../levels';
import { getLocation } from '../../locations';
import { preloadProjectiles } from '../../projectiles';
import { HintsService } from '../../services/HintsService';
import { PlayerService } from '../../services/PlayerService';
import { QuestService } from '../../services/QuestService';
import { gameStorage } from '../../storage';
import { connectionStateCollection } from '../../storage/collections/connectionState.collection';
import { enemyStateCollection } from '../../storage/collections/enemyState.collection';
import { gameStateCollection } from '../../storage/collections/gameState.collection';
import { playerStateCollection } from '../../storage/collections/playerState.collection';
import { playerWeaponCollection } from '../../storage/collections/playerWeapon.collection';
import { Damageable, Enemy, Game, Level, Loading, Location, Player, ScoreEvents, ShopEvents } from '../../types/';
import { WaveInfo, WeaponStatus } from '../../ui';
import { createLogger } from '../../utils/logger';
import { GameOverView } from '../../views/gameover';
import { LoadingView } from '../../views/loading/LoadingView';
import { PauseView } from '../../views/pause';
import { preloadWeapons } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { SceneKeys } from '../index';
import { MenuSceneTypes } from '../MenuScene/MenuSceneTypes';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  levelId: LevelId;
}

export class GameplayScene extends Phaser.Scene {
  private location!: Location.BaseClass;

  private loadingView!: LoadingView;
  private playerService: PlayerService;
  private questService: QuestService;

  private pingText!: Phaser.GameObjects.Text;

  private shop!: BaseShop;
  private enemies: Map<string, Damageable.Entity> = new Map();
  private damageableObjects: Map<string, Damageable.Entity> = new Map();

  private levelConfig!: Level.Config;
  private levelId!: LevelId;
  private questId!: string;

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private decalController!: DecalController;
  private projectileController!: ProjectileController;
  private questController!: QuestController;
  private waveController!: WaveController;
  private scoreController!: ScoreController;
  private weaponController!: WeaponController;
  private shopController!: ShopController;
  private bloodController!: BloodController;
  private multiplayerController!: MultiplayerController;
  private keyboardController!: KeyBoardController;
  private changeWeaponKey!: Phaser.Input.Keyboard.Key;
  private pauseView!: PauseView;
  private gameOverView!: GameOverView;
  private mainPlayerId!: string;
  private players: Map<string, PlayerEntity> = new Map();

  private attempt: number = 1;
  private playTime: number = 0;
  private kills: number = 0;

  private isPause: boolean = false;
  private isGameOver: boolean = false;
  private isMultiplayer: boolean = false;

  private storage!: StorageSpace;

  constructor() {
    super({
      key: SceneKeys.GAMEPLAY
    });
    this.playerService = PlayerService.getInstance();
    this.questService = QuestService.getInstance();
  }

  init({ levelId }: GameplaySceneData) {
    this.loadingView = new LoadingView(this, { minLoadingTime: 2000 });
    this.levelConfig = getLevel(levelId);
    this.levelId = levelId;
    this.location = getLocation(this, this.levelConfig.location);
    this.storage = StorageSpace.create(gameStorage)!;

    HintsService.getInstance().getHint().then(hint => {
      this.loadingView.setHint(hint);
    });
  }

  async preload(): Promise<void> {
    this.location.preload();

    PlayerEntity.preload(this);
    BloodController.preload(this);
    WaveController.preloadEnemies(this, this.levelConfig.waves());
    PauseView.preload(this);
    GameOverView.preload(this);

    preloadWeapons(this);
    preloadProjectiles(this);
    preloadFx(this);
  }

  clear(): void {
    this.isPause = false;
    this.isGameOver = false;
    this.kills = 0;
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
    this.pauseView.close();
    // this.multiplayerController?.destroy();
    this.keyboardController.destroy();

    this.resume();

    offEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    offEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    offEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    offEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    offEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);
  }

  async create(): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    this.mainPlayerId = playerId;

    onEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    onEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    onEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    onEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    onEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);

    this.storage.on<Player.State>(playerStateCollection, 'Add', this.spawnPlayer.bind(this));
    this.storage.on<EnemyState>(enemyStateCollection, 'Add', this.handleSpawnEnemy.bind(this));

    this.location.create();

    this.pauseView = new PauseView(this);
    this.gameOverView = new GameOverView(this);

    this.scoreController = new ScoreController(this, this.storage);
    this.bloodController = new BloodController(this);
    this.keyboardController = new KeyBoardController(this, this.players, playerId, this.storage);
    this.weaponController = new WeaponController(this, this.players, this.storage, playerId);
    this.shopController = new ShopController(this, this.players, playerId, this.shop, this.levelConfig.weapons, this.storage);
    this.decalController = new DecalController(this, 0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT, 5);
    this.projectileController = new ProjectileController(this, this.damageableObjects);
    this.waveController = new WaveController(this, this.levelConfig.waves(), this.storage);

    this.waveInfo = new WaveInfo(this, this.storage);
    this.weaponStatus = new WeaponStatus(this, this.storage, playerId);

    this.add.text(20, DISPLAY.HEIGHT - 30, VERSION, { fontSize: 16, color: '#ffffff' }).setDepth(10000);

    this.physics.world.setBounds(0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT);
    this.shopController.setInteractablePlayerId(playerId);

    (window as any)['_s'] = this.storage;
  }

  private handleLoadingComplete(payload: Loading.Events.LoadingComplete.Payload): void {
    const gameId = new URLSearchParams(window.location.search).get('game');
    if (gameId) {
      this.multiplayerInit(this.mainPlayerId, gameId);
    } else {
      this.singlePlayerInit(this.mainPlayerId);
    }
    this.playTime = 0;
  }

  private async singlePlayerInit(playerId: string): Promise<void> {
    const quest = await this.questService.getCurrentQuest(this.levelId);

    if (quest) {
      this.questController = new QuestController(this, this.levelId, quest.id);
      this.questId = quest.id;
    }

    this.storage.getCollection<GameState>(gameStateCollection)!.updateItem('game', {
      host: playerId,
      playersCount: 2,
      started: false,
      createdAt: Date.now().toString(),
    });
    this.storage.getCollection<Player.State>(playerStateCollection)!.addItem(playerId, { x: 0, y: 0, vx: 0, vy: 0 });
    emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.M4, price: 0 });

    this.waveController.start();
    this.projectileController.setSimulate(false);

    emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 50000 }); // TODO: remove
  }

  private handlePause(payload: Game.Events.Pause.Payload): void {
    this.isPause = !this.isPause;

    if (this.isPause) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private pause() {
    this.pauseView.open({
      levelId: this.levelId,
      questId: this.questId
    });
    this.time.timeScale = 0;
    this.physics.world.pause();
  }

  private resume() {
    this.pauseView.close();
    this.time.timeScale = 1;
    this.physics.world.resume();
  }

  private handleReplay(payload: Game.Events.Replay.Payload): void {
    this.attempt++;
    this.clear();
    this.scene.start(SceneKeys.RELOAD, { sceneKey: SceneKeys.GAMEPLAY, payload: { levelId: this.levelId } });
  }

  private handleExit(payload: Game.Events.Exit.Payload): void {
    this.clear();
    this.scene.start(SceneKeys.MENU, { view: MenuSceneTypes.ViewKeys.HOME });
  }

  /** 
   *      Multiplayer 
   */
  private multiplayerInit(playerId: string, gameId: string): void {
    this.isMultiplayer = true;

    this.projectileController.setSimulate(true);
    this.pingText = this.add.text(10, 10, '', { fontSize: 16, color: '#ffffff' }).setDepth(10000);

    this.storage.on<ConnectionState>(connectionStateCollection, 'Update', this.handleConnectionState.bind(this));
    this.storage.on<GameState>(gameStateCollection, 'Add', () => {
      const currentWeaponId = this.weaponController.getCurrentWeapon(playerId);
      const currentWeapon = this.storage.getCollection<PlayerWeapon>(playerWeaponCollection)!.getItem(playerId);
      // emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 50000 }); // TODO: remove

      if (!currentWeaponId) {
        emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.AWP, price: 0 });
      }

      this.multiplayerController.setReady();
    });

    this.storage.getCollection<GameState>(gameStateCollection)!.subscribe('Add', (id, record, collection, from) => {
      console.log('is host', record.data.host === playerId);
      this.storage.getCollection<EnemyState>(enemyStateCollection)!.setReadonly(record.data.host !== playerId);
    });

    this.multiplayerController = new MultiplayerController(this, this.storage);
    this.multiplayerController.connect(gameId, playerId).then(() => { });
  }

  private handleConnectionState() {
    const connections = this.storage.getCollection<ConnectionState>(connectionStateCollection)!;
    const game = this.storage.getCollection<GameState>(gameStateCollection)!.getItem('game');

    const allReady = connections.getSize() === game?.playersCount && connections.getItems().every(data => data.ready);
    if (allReady && game?.host === this.mainPlayerId) {
      console.log('all ready');
      this.projectileController.setSimulate(false);
      this.waveController.start();
    }
  }

  private handleEnemyDeath({ id }: Enemy.Events.Death.Payload): void {
    this.enemies.delete(id);
    this.kills++;
    this.damageableObjects.delete(id);
    this.storage.getCollection<EnemyState>(enemyStateCollection)!.removeItem(id);
  }

  private handleSpawnEnemy(id: string, record: SyncCollectionRecord<EnemyState>, collection: SyncCollection<EnemyState>, from: string): void {
    if (this.isGameOver) {
      return;
    }
    const enemy = createEnemy(id, record.data.type as Enemy.Type, this, record, this.storage);
    this.enemies.set(id, enemy);
    enemy.setLocationBounds(this.location.getBounds());
    this.damageableObjects.set(id, enemy);
  }

  public spawnPlayer(playerId: string, stateRecord: SyncCollectionRecord<Player.State>): void {
    this.storage.getCollection<Player.State>(playerStateCollection)!.setReadonly(playerId !== this.mainPlayerId, playerId);

    if (this.players.has(playerId)) {
      logger.warn(`Player ${playerId} already exists.`);
      return;
    }

    const player = new PlayerEntity(this, playerId, stateRecord, this.storage);
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
    if (this.isMultiplayer) {
      this.pingText.setText(`Ping: ${this.multiplayerController.ping}ms`);
    }

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
    this.enemies.forEach((enemy) => {
      enemy.update(time, delta);
      if (enemy instanceof EnemyEntity && enemy.getPosition().x < 0) {
        if (GAMEOVER) {
          this.isGameOver = true;
          this.gameOverView.open({ attempt: this.attempt, time: this.playTime, kills: this.kills });
          this.waveController.stop();
        }

        const enemyEntity = this.enemies.get(enemy.id);
        if (enemyEntity) {
          // @ts-ignore
          enemyEntity.destroy();
        }
        this.handleEnemyDeath({ id: enemy.id });
      }
    });

    // Обрабатываем попадания пуль
    this.projectileController.update(time, delta);
    this.waveInfo.update(time, delta);

    if (!this.isPause) {
      this.playTime += delta;
    }
  }

  destroy(): void {
    this.clear();
  }

} 