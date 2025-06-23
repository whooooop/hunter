import { registry, StorageSpace, SyncCollection, SyncCollectionRecord } from '@hunter/multiplayer';
import { ConnectionState, CountdownEvent, EmbienceEvent, EnemyState, GameState, PlayerSkin, ReplayEvent } from '@hunter/storage-proto/src/storage';
import * as Phaser from 'phaser';
import { createGame } from '../../api/game';
import { preloadBossSound } from '../../audio/boss';
import { playDangerSound, preloadDangerSound } from '../../audio/danger';
import { playGameoverAudio, preloadGameoverAudio } from '../../audio/gameover';
import { stopMenuAudio } from '../../audio/menu';
import { DISPLAY, FONT_FAMILY, GAMEOVER, VERSION } from '../../config';
import { BloodController, DecalController, KeyBoardController, MultiplayerController, ProjectileController, QuestController, ScoreController, ShopController, WaveController, WeaponController } from '../../controllers';
import { createEnemy } from '../../enemies';
import { EnemyEntity } from '../../entities/EnemyEntity';
import { PlayerEntity } from '../../entities/PlayerEntity';
import { ShopEntity } from '../../entities/ShopEntity';
import { preloadFx } from '../../fx';
import { emitEvent, offEvent, onEvent } from '../../GameEvents';
import { getLevel, LevelId } from '../../levels';
import { getLocation } from '../../locations';
import { preloadProjectiles } from '../../projectiles';
import { AudioService } from '../../services/AudioService';
import { HintsService } from '../../services/HintsService';
import { PlayerService } from '../../services/PlayerService';
import { QuestService } from '../../services/QuestService';
import { StatsService } from '../../services/StatsService';
import { gameStorage } from '../../storage';
import { connectionStateCollection } from '../../storage/collections/connectionState.collection';
import { enemyStateCollection } from '../../storage/collections/enemyState.collection';
import { countdownEvent, embienceEvent, replayEventCollection } from '../../storage/collections/events.collection';
import { gameStateCollection } from '../../storage/collections/gameState.collection';
import { playerSkinCollection } from '../../storage/collections/playerSkin.collection';
import { playerStateCollection } from '../../storage/collections/playerState.collection';
import { Damageable, Enemy, Game, Level, Loading, Location, Player, ShopEvents } from '../../types';
import { UiMute } from '../../ui';
import { UiFullscreen } from '../../ui/Fullscreen';
import { createLogger } from '../../utils/logger';
import { GameOverView } from '../../views/gameover';
import { LoadingView } from '../../views/loading/LoadingView';
import { PauseView } from '../../views/pause';
import { preloadWeapons } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { SceneKeys } from '../index';
import { MenuSceneTypes } from '../MenuScene/MenuSceneTypes';
import { Countdown } from './components/Countdown';
import { UiStartGameButton } from './components/StartGameButton';
import { WaveInfo } from './components/WaveInfo';
import { WeaponStatus } from './components/WeaponStatus';

const logger = createLogger('GameplayScene');

interface GameplaySceneData {
  levelId: LevelId;
  gameId?: string;
}

export class GameplayScene extends Phaser.Scene {
  private location!: Location.BaseClass;

  private loadingView!: LoadingView;
  private playerService: PlayerService;
  private questService: QuestService;

  private pingText!: Phaser.GameObjects.Text;
  private gameIdText!: Phaser.GameObjects.Text;

  private shop!: ShopEntity;
  private enemies!: Map<string, Damageable.Entity>;
  private damageableObjects!: Map<string, Damageable.Entity>;

  private levelConfig!: Level.Config;
  private levelId!: LevelId;
  private questId!: string;

  private waveInfo!: WaveInfo;
  private weaponStatus!: WeaponStatus;
  private uiMute!: UiMute;
  private uiFullscreen!: UiFullscreen;
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
  private startGameButton!: UiStartGameButton;
  private countdown!: Countdown;
  private mainPlayerId!: string;
  private players!: Map<string, PlayerEntity>;
  private dangerNotification!: Set<string>;

  private isHost!: boolean;
  private playTime!: number;
  private kills!: number;

  private gameId?: string;
  private isGameOver!: boolean;
  private isMultiplayer!: boolean;
  private sceneLoaded!: boolean;

  private attempt: number = 1;

  private storage!: StorageSpace;

  private handleVisibilityStateChangedBind!: (state: any) => void;

  constructor() {
    super({
      key: SceneKeys.GAMEPLAY
    });
    this.playerService = PlayerService.getInstance();
    this.questService = QuestService.getInstance();

    (window as any)._r = registry;
  }

  init({ levelId, gameId }: GameplaySceneData) {
    const playerId = this.playerService.getCurrentPlayerId();

    this.mainPlayerId = playerId;
    this.loadingView = new LoadingView(this, { minLoadingTime: 2000 });
    this.levelConfig = getLevel(levelId);
    this.levelId = levelId;
    this.gameId = gameId;
    this.location = getLocation(this, this.levelConfig.location);
    this.storage = StorageSpace.create(gameStorage)!;
    this.kills = 0;
    this.playTime = 0;
    this.isGameOver = false;
    this.isMultiplayer = false;
    this.sceneLoaded = false;
    this.players = new Map();
    this.enemies = new Map();
    this.damageableObjects = new Map();
    this.dangerNotification = new Set();

    HintsService.getInstance().getHint().then(hint => {
      this.loadingView.setHint(hint);
    });

    onEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    onEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    onEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    onEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    onEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);
  }

  async preload(): Promise<void> {
    this.location.preload();

    PlayerEntity.preload(this);
    BloodController.preload(this);
    KeyBoardController.preload(this);
    ProjectileController.preload(this);
    WaveController.preloadEnemies(this, this.levelConfig.waves());
    PauseView.preload(this);
    GameOverView.preload(this);
    WeaponStatus.preload(this);
    ShopController.preload(this);

    preloadWeapons(this);
    preloadProjectiles(this);
    preloadFx(this);
    preloadGameoverAudio(this);
    preloadDangerSound(this);
    preloadBossSound(this);

    UiMute.preload(this);
    UiStartGameButton.preload(this);
  }

  clear(): void {
    this.location.destroy();
    this.waveController.destroy();
    this.scoreController.destroy();
    this.weaponController.destroy();
    this.shopController.destroy();
    this.decalController.destroy();
    this.projectileController.destroy();
    this.waveInfo.destroy();
    this.weaponStatus.destroy();
    this.uiMute.destroy();
    // this.uiFullscreen.destroy();
    this.players.forEach(player => player.destroy());
    this.pauseView.close();
    this.multiplayerController?.destroy();
    this.keyboardController.destroy();

    this.resume();

    offEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    offEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    offEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    offEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    offEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);
    window.bridge.game.off(window.bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED, this.handleVisibilityStateChangedBind);
  }

  async create(): Promise<void> {
    this.storage.on<Player.State>(playerStateCollection, 'Add', this.spawnPlayer.bind(this));
    this.storage.on<EnemyState>(enemyStateCollection, 'Add', this.handleSpawnEnemy.bind(this));
    this.storage.on<GameState>(gameStateCollection, 'Update', this.handleGameStateUpdate.bind(this));
    this.storage.on<EmbienceEvent>(embienceEvent, 'Add', this.handleEmbience.bind(this));
    this.storage.on<CountdownEvent>(countdownEvent, 'Add', this.handleCountdown.bind(this));

    this.handleVisibilityStateChangedBind = this.handleVisibilityStateChanged.bind(this);
    // window.bridge.game.on(window.bridge.EVENT_NAME.VISIBILITY_STATE_CHANGED, this.handleVisibilityStateChangedBind);

    this.location.create();

    this.pauseView = new PauseView(this);
    this.gameOverView = new GameOverView(this);

    this.scoreController = new ScoreController(this, this.storage);
    this.bloodController = new BloodController(this, this.location.getBounds());
    this.keyboardController = new KeyBoardController(this, this.mainPlayerId, this.storage);
    this.weaponController = new WeaponController(this, this.players, this.storage, this.mainPlayerId);
    this.shopController = new ShopController(this, this.players, this.mainPlayerId, this.shop, this.levelConfig.weapons, this.storage);
    this.decalController = new DecalController(this, 0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT, 5);
    this.projectileController = new ProjectileController(this, this.damageableObjects, this.storage, this.location.getBounds());
    this.waveController = new WaveController(this, this.levelConfig.waves(), this.storage);
    this.countdown = new Countdown(this, 0, 0);

    this.waveInfo = new WaveInfo(this, this.storage);
    this.weaponStatus = new WeaponStatus(this, this.storage, this.mainPlayerId);
    this.uiMute = new UiMute(this, DISPLAY.WIDTH - 90, 74).setDepth(600).setButtonScale(0.8);
    this.add.existing(this.uiMute);

    this.physics.world.setBounds(0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT);
    this.shopController.setInteractablePlayerId(this.mainPlayerId);

    (window as any)['_g'] = this;

    this.add.text(20, DISPLAY.HEIGHT - 30, VERSION.toUpperCase(), { fontSize: 16, color: '#ffffff', fontFamily: FONT_FAMILY.REGULAR })
      .setDepth(10000)
      .setOrigin(0, 1);
  }


  private handleLoadingComplete(payload: Loading.Events.LoadingComplete.Payload): void {
    this.sceneLoaded = true;
    StatsService.incGameplay(this.levelId);
    window.bridge.platform.sendMessage("gameplay_started");

    if (this.gameId) {
      this.multiplayerInit(this.mainPlayerId, this.gameId);
    } else {
      this.singlePlayerInit(this.mainPlayerId);
    }
    this.playTime = 0;

    stopMenuAudio(this, 5000);
  }

  private handleGameStateUpdate(id: string, record: SyncCollectionRecord<GameState>, collection: SyncCollection<GameState>, from: string): void {
    if (this.isGameOver) {
      return;
    }

    if (record.data.paused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private handleVisibilityStateChanged(state: any): void {
    const gameCollection = this.storage.getCollection<GameState>(gameStateCollection);
    if (state === "hidden" && !this.isGameOver && this.sceneLoaded && gameCollection) {
      const gameState = gameCollection.getItem('game');
      if (gameState) {
        gameState.paused = true;
      }
    }
  }

  private async singlePlayerInit(playerId: string): Promise<void> {
    const quest = await this.questService.getCurrentQuest(this.levelId);
    this.isHost = true;

    if (quest) {
      this.questController = new QuestController(this, this.levelId, quest.id);
      this.questId = quest.id;
    }

    this.storage.getCollection<GameState>(gameStateCollection)!.updateItem('game', {
      host: playerId,
      levelId: this.levelId,
      playersCount: 1,
      started: false,
      paused: false,
      finished: false,
      createdAt: Date.now().toString(),
    });
    this.storage.getCollection<PlayerSkin>(playerSkinCollection)!.addItem(playerId, { body: 'b1' });
    this.storage.getCollection<Player.State>(playerStateCollection)!.addItem(playerId, { x: 0, y: 0, vx: 0, vy: 0 });
    emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.GLOCK, price: 0 });
    // emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.AWP, price: 0 });
    // emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.MINE, price: 0 });
    // emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.LAUNCHER, price: 0 });
    // emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 50000 });

    this.startGame(2000);
  }

  private handleCountdown(id: string, record: SyncCollectionRecord<CountdownEvent>): void {
    this.countdown.start(record.data.duration, record.data.delay);
  }

  private handlePause(): void {
    if (!this.sceneLoaded) {
      return;
    }
    const gameState = this.storage.getCollection<GameState>(gameStateCollection)!.getItem('game')!;
    gameState.paused = !gameState.paused;
  }

  async startGame(delay: number = 1000) {
    const gameCollection = this.storage.getCollection<GameState>(gameStateCollection)!;
    const gameState = gameCollection.getItem('game')!;
    gameState.started = true;

    const duration = 3000;
    this.storage.getCollection<CountdownEvent>(countdownEvent)!.addItem('countdown', { delay, duration });
    this.projectileController.setSimulate(false);
    this.time.delayedCall(delay + duration, () => this.waveController.start());
  }

  private stopGame() {
    window.bridge.platform.sendMessage("gameplay_stopped");
    this.time.timeScale = 0;
    this.physics.world.pause();
  }

  private resumeGame() {
    window.bridge.platform.sendMessage("gameplay_started");
    this.time.timeScale = 1;
    this.physics.world.resume();
  }

  private pause() {
    this.stopGame();
    this.pauseView.open({
      levelId: this.levelId,
      questId: this.questId,
      showReplay: this.isHost
    });
  }

  private resume() {
    this.pauseView.close();
    this.resumeGame();
  }

  private async handleReplay(): Promise<void> {
    const gameCollection = this.storage.getCollection<GameState>(gameStateCollection)!;
    const gameState = gameCollection.getItem('game')!;

    if (this.isMultiplayer) {
      const { code } = await createGame(gameState.playersCount);
      this.storage.getCollection<ReplayEvent>(replayEventCollection)!.addItem(code, {
        gameId: code
      });
      this.replay(code);
    } else {
      this.replay();
    }
  }

  private replay(gameId?: string): void {
    this.attempt++;
    this.clear();
    this.scene.start(SceneKeys.RELOAD, {
      sceneKey: SceneKeys.GAMEPLAY,
      payload: {
        levelId: this.levelId,
        gameId
      }
    });
  }

  private handleExit(payload: Game.Events.Exit.Payload): void {
    this.clear();
    this.scene.start(SceneKeys.MENU, { view: MenuSceneTypes.ViewKeys.HOME });
  }

  private handleEmbience(id: string, record: SyncCollectionRecord<EmbienceEvent>): void {
    AudioService.playAudio(this, record.data.assetKey);
  }

  private multiplayerInit(playerId: string, gameId: string): void {
    this.isMultiplayer = true;
    this.projectileController.setSimulate(true);
    this.pingText = this.add.text(10, 10, '', { fontSize: 16, color: '#ffffff' }).setDepth(1000);
    this.gameIdText = this.add.text(10, 30, '', { fontSize: 16, color: '#ffffff' }).setDepth(1000);

    this.storage.on<ConnectionState>(connectionStateCollection, 'Update', this.handleConnectionState.bind(this));
    this.storage.on<ConnectionState>(connectionStateCollection, 'Add', this.handleConnectionState.bind(this));
    this.storage.on<ConnectionState>(connectionStateCollection, 'Remove', this.handleConnectionState.bind(this));
    this.storage.on<GameState>(gameStateCollection, 'Add', (id, record) => {
      if (record.data.finished) {
        return;
      }

      const playerWeapons = this.weaponController.getPlayerWeapons(playerId);
      // emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 50000 }); // TODO: remove

      this.isHost = record.data.host === playerId;
      this.storage.getCollection<EnemyState>(enemyStateCollection)!.setReadonly(!this.isHost);
      this.storage.getCollection<EmbienceEvent>(embienceEvent)!.setReadonly(!this.isHost);
      this.createStartGameButton();

      if (!playerWeapons.length) {
        emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.GLOCK, price: 0 });
      }
    });

    this.storage.on<Player.State>(playerStateCollection, 'Remove', (playerId: string) => {
      const player = this.players.get(playerId);
      if (player) {
        player.destroy();
        this.players.delete(playerId);
      }
      this.updateStartGameButton();
    });

    this.storage.getCollection<ReplayEvent>(replayEventCollection)!.subscribe('Add', (id, record) => {
      setTimeout(() => {
        this.replay(record.data.gameId);
      }, 1000);
    });

    this.multiplayerController = new MultiplayerController(this, this.storage);
    this.multiplayerController.connect(gameId, playerId);
  }

  createStartGameButton(): void {
    const gameCollection = this.storage.getCollection<GameState>(gameStateCollection)!;
    const gameState = gameCollection.getItem('game')!;

    if (gameState.started) {
      return;
    }

    this.startGameButton = new UiStartGameButton(this, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - 100);
    this.startGameButton.setDepth(800);
    this.add.existing(this.startGameButton);

    this.startGameButton.setHostMode(this.isHost);
    this.updateStartGameButton();

    if (this.isHost) {
      this.multiplayerController.setReady();
    }

    this.startGameButton.onClick(async () => {
      this.multiplayerController.setReady();
      await this.startGameButton.hide();
      this.startGameButton.destroy();
      if (this.isHost) {
        this.startGame(1000);
      }
    });
  }

  updateStartGameButton(): void {
    const gameCollection = this.storage.getCollection<GameState>(gameStateCollection)!;
    const connections = this.storage.getCollection<ConnectionState>(connectionStateCollection)!;
    const gameState = gameCollection.getItem('game')!;
    const connectionsCount = connections.getSize();
    const readyCount = connections.getItems().filter(data => data.ready).length;
    const canStart = connectionsCount > 1 && readyCount === connectionsCount;

    if (this.isHost && !gameState.started) {
      this.startGameButton.setDisabled(!canStart);
    }
  }

  private handleConnectionState() {
    this.updateStartGameButton();
  }

  private handleEnemyDeath({ id }: Enemy.Events.Death.Payload): void {
    this.enemies.delete(id);
    this.kills++;
    this.damageableObjects.delete(id);
    this.storage.getCollection<EnemyState>(enemyStateCollection)!.removeItem(id);
  }

  private handleSpawnEnemy(id: string, record: SyncCollectionRecord<EnemyState>): void {
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

    const skin = this.storage.getCollection<PlayerSkin>(playerSkinCollection)!.getItemRecord(playerId)!;
    const player = new PlayerEntity(this, playerId, stateRecord, skin, this.storage);

    this.players.set(playerId, player);
    player.setLocationBounds(this.location.getBounds());
  }

  public addDamageableObject(id: string, object: Damageable.Entity): void {
    this.damageableObjects.set(id, object);
  }

  public addShop(shop: ShopEntity): void {
    this.shop = shop;
  }

  private handleGameEnd(): void {
    const score = this.scoreController.getTotalScore(this.mainPlayerId);
    const stats = StatsService.getLevelStats(this.levelId);
    if (score > stats.bestScore) {
      StatsService.setBestScore(this.levelId, score);
    }
    if (this.isGameOver) {
      this.stopGame();
    }
  }

  update(time: number, delta: number): void {
    if (this.isMultiplayer && this.pingText) {
      this.pingText.setText(`Ping: ${this.multiplayerController.ping}ms`);
      this.gameIdText.setText(`Game ID: ${this.gameId}`);
    }

    const mainPlayer = this.players.get(this.mainPlayerId);

    this.location.update(time, delta);
    this.shopController.update(time, delta);
    this.keyboardController.update(time, delta);

    this.players.forEach(player => {
      player.update(time, delta);
    });

    if (mainPlayer) {
      const weapon = mainPlayer.getWeapon();
      if (weapon) {
        this.weaponStatus.setAmmo(
          weapon.getCurrentAmmo(),
          weapon.getMaxAmmo()
        );
      }
    }

    this.enemies.forEach((enemy) => {
      enemy.update(time, delta);
      const position = enemy instanceof EnemyEntity && enemy.getPosition();
      if (position && position.x < 0) {
        if (GAMEOVER && !this.isGameOver) {
          this.isGameOver = true;
          this.handleGameEnd();
          playGameoverAudio(this);
          window.bridge.platform.sendMessage("gameplay_stopped");
          this.gameOverView.open({
            attempt: this.attempt,
            time: this.playTime,
            kills: this.kills,
            showReplay: this.isHost,
            score: this.scoreController.getTotalScore(this.mainPlayerId),
            levelId: this.levelId
          });
          if (this.isHost) {
            this.storage.getCollection<GameState>(gameStateCollection)!.getItem('game')!.finished = true;
            this.waveController.stop();
          }
        }

        const enemyEntity = this.enemies.get(enemy.id);
        if (enemyEntity) {
          // @ts-ignore
          enemyEntity.destroy();
        }
        this.handleEnemyDeath({ id: enemy.id });
      } else if (position && position.x < 250 && !this.isGameOver) {
        if (!this.dangerNotification.has(enemy.id)) {
          this.dangerNotification.add(enemy.id);
          playDangerSound(this);
        }
      }
    });

    this.projectileController.update(time, delta);
    this.waveInfo.update(time, delta);

    if (!this.storage.getCollection<GameState>(gameStateCollection)!.getItem('game')?.paused) {
      this.playTime += delta;
    }
  }

  destroy(): void {
    this.clear();
  }

} 