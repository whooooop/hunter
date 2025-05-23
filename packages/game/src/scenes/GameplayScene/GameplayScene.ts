import * as Phaser from 'phaser';
import { SceneKeys } from '../index';
import { PlayerEntity } from '../../entities/PlayerEntity';
import { createLogger } from '../../utils/logger';
import { WeaponStatus, WaveInfo } from '../../ui';
import { BaseShop } from '../../BaseShop';
import { DecalController, BloodController, ProjectileController, WaveController, ScoreController, ShopController, WeaponController, QuestController, MultiplayerController, KeyBoardController } from '../../controllers';
import { Player, Enemy, Game, Damageable, Location, ShopEvents, Level, ScoreEvents, UpdateScoreEventPayload, Loading } from '../../types/';
import { emitEvent, offEvent, onEvent } from '../../GameEvents';
import { preloadWeapons } from '../../weapons';
import { WeaponType } from '../../weapons/WeaponTypes';
import { preloadProjectiles } from '../../projectiles';
import { createEnemy } from '../../enemies';
import { preloadFx } from '../../fx';
import { getLocation } from '../../locations';
import { LoadingView } from '../../views/loading/LoadingView'; 
import { getLevel, LevelId } from '../../levels';
import { PauseView } from '../../views/pause';
import { Wave } from '../../types/WaveTypes';
import { PlayerService } from '../../services/PlayerService';
import { QuestService } from '../../services/QuestService';
import { HintsService } from '../../services/HintsService';
import { DISPLAY, GAMEOVER, VERSION } from '../../config';
import { GameOverView } from '../../views/gameover';
import { MenuSceneTypes } from '../MenuScene/MenuSceneTypes';
import { EnemyEntity } from '../../entities/EnemyEntity';
import { gameStorage } from '../../storage';
import { StorageSpace, SyncCollection, SyncCollectionRecord } from '@hunter/multiplayer/dist/client';
import { playerStateCollection } from '../../storage/collections/playerState.collection';
import { connectionStateCollection } from '../../storage/collections/connectionState.collection';

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
  private bosses: Map<string, Damageable.Entity> = new Map();
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
  private lastSentState: number = 0;
  private lastStateHash: string = ''

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
  
  init({ levelId } : GameplaySceneData) {
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

    offEvent(this, Wave.Events.WaveStart.Local, this.handleWaveStart, this);
    offEvent(this, Wave.Events.Spawn.Local, this.handleSpawnEnemy, this);
    offEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    offEvent(this, ScoreEvents.UpdateScoreEvent, this.handleUpdateScore, this);
    offEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    offEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    offEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    offEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);

    // offEvent(this, Player.Events.Join.Remote, this.handlePlayerJoin, this);
    // offEvent(this, Player.Events.Left.Remote, this.handlePlayerLeft, this);
    // offEvent(this, Game.Events.State.Remote, this.handleGameState, this);
  }
  
  async create(): Promise<void> {
    const playerId = this.playerService.getCurrentPlayerId();
    this.mainPlayerId = playerId;

    onEvent(this, Wave.Events.WaveStart.Local, this.handleWaveStart, this);
    onEvent(this, Wave.Events.Spawn.Local, this.handleSpawnEnemy, this);
    onEvent(this, Enemy.Events.Death.Local, this.handleEnemyDeath, this);
    onEvent(this, ScoreEvents.UpdateScoreEvent, this.handleUpdateScore, this);
    onEvent(this, Game.Events.Pause.Local, this.handlePause, this);
    onEvent(this, Game.Events.Replay.Local, this.handleReplay, this);
    onEvent(this, Game.Events.Exit.Local, this.handleExit, this);
    onEvent(this, Loading.Events.LoadingComplete.Local, this.handleLoadingComplete, this);

    this.location.create();

    this.pauseView = new PauseView(this);
    this.gameOverView = new GameOverView(this);

    this.scoreController = new ScoreController(this);
    this.bloodController = new BloodController(this);
    this.keyboardController = new KeyBoardController(this, this.players, playerId);
    this.weaponController = new WeaponController(this, this.players);
    this.shopController = new ShopController(this, this.players, playerId, this.shop, this.levelConfig.weapons);
    this.decalController = new DecalController(this, 0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT, 5);
    this.projectileController = new ProjectileController(this, this.damageableObjects);
    this.waveController = new WaveController(this, this.levelConfig.waves());
    
    this.waveInfo = new WaveInfo(this);
    this.weaponStatus = new WeaponStatus(this);

    const version = this.add.text(20, DISPLAY.HEIGHT - 30, VERSION, { fontSize: 16, color: '#ffffff' }).setDepth(10000);

    this.physics.world.setBounds(0, 0, DISPLAY.WIDTH, DISPLAY.HEIGHT);
    this.shopController.setInteractablePlayerId(playerId);
  }

  private handleLoadingComplete(payload: Loading.Events.LoadingComplete.Payload): void {
     this.multiplayerInit(this.mainPlayerId);
    //  this.singlePlayerInit(this.mainPlayerId);
     this.playTime = 0;
  }

  private async singlePlayerInit(playerId: string): Promise<void> {
    const quest = await this.questService.getCurrentQuest(this.levelId);

    if (quest) {
      this.questController = new QuestController(this, this.levelId, quest.id);
      this.questId = quest.id;
    }

    // this.spawnPlayer(playerId, PLAYER_POSITION_X, PLAYER_POSITION_Y);
    this.waveController.start();
    this.projectileController.setSimulate(false);

    emitEvent(this, ShopEvents.WeaponPurchasedEvent, { playerId, weaponType: WeaponType.MINE, price: 0 });
    // emitEvent(this, ScoreEvents.IncreaseScoreEvent, { playerId, score: 50000 }); // TODO: remove
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
  private multiplayerInit(playerId: string): void {
    this.isMultiplayer = true;
    // onEvent(this, Game.Events.State.Remote, this.handleGameState, this);
    // onEvent(this, Player.Events.Join.Remote, this.handlePlayerJoin, this);
    // onEvent(this, Player.Events.Left.Remote, this.handlePlayerLeft, this);
    // onEvent(this, Game.Events.Multiplayer.Ready.Local, this.handleMultiplayerReady, this);
    // onEvent(this, Wave.Events.Spawn.Remote, this.handleSpawnEnemy, this);

    this.projectileController.setSimulate(true);
    this.pingText = this.add.text(10, 10, '', { fontSize: 16, color: '#ffffff' }).setDepth(10000);

    this.storage.getCollection<Player.State>(playerStateCollection)!.subscribe('Add', (id, record, collection, from) => {
      this.spawnPlayer(id, record);
    });

    this.multiplayerController = new MultiplayerController(this, this.storage);
    this.multiplayerController.connect('GAME1', playerId).then(() => {
      setTimeout(() => {
          this.storage.getCollection<Player.State>(playerStateCollection)!.forEach((record, id, collection) => {
            
            this.spawnPlayer(id, record);
          });
          this.multiplayerController.setReady();
      }, 2000);
    });
  }
  
  // private handleGameState(payload: Game.Events.State.Payload): void {
  //   payload.connected.forEach(playerId => {
  //     const player = payload.playersState.find(p => p.id === playerId);
  //     if (player) {
  //       this.spawnPlayer(
  //         player.id, 
  //         player.position?.x || PLAYER_POSITION_X, 
  //         player.position?.y || PLAYER_POSITION_Y
  //       );
  //       this.weaponController.setWeaponById({ playerId, weaponId: player.weaponId });
  //     }
  //   });
  // }

  private handleMultiplayerReady(): void {
    this.projectileController.setSimulate(false);
    this.waveController.start();
  }

  // private handlePlayerJoin({ playerId, playerState }: Player.Events.Join.Payload): void {
  //   this.spawnPlayer(playerId, playerState?.position?.x!, playerState?.position?.y!);
  //   this.weaponController.setWeaponById({ playerId, weaponId: playerState?.weaponId! });
  // }

  // private handlePlayerLeft(payload: Player.Events.Left.Payload): void {
  //   const player = this.players.get(payload.playerId);
  //   if (player) {
  //     player.destroy();
  //     this.players.delete(payload.playerId);
  //   }
  // }






  private handleEnemyDeath({ id }: Enemy.Events.Death.Payload): void {
    this.enemies.delete(id);
    this.kills++;
    this.damageableObjects.delete(id);
    emitEvent(this, Game.Events.Enemies.Local, {
      count: this.enemies.size
    });
  }

  private handleSpawnEnemy({ id, enemyType, config, boss }: Wave.Events.Spawn.Payload): void {
    if (this.isGameOver) {
      return;
    }
    const enemy = createEnemy(id, enemyType, this, config);
    this.enemies.set(id, enemy);
    enemy.setLocationBounds(this.location.getBounds());
    this.damageableObjects.set(id, enemy);

    if (boss) {
      this.bosses.set(id, enemy);
    }

    emitEvent(this, Game.Events.Enemies.Local, {
      count: this.enemies.size
    });
  }

  private handleWaveStart(payload: Wave.Events.WaveStart.Payload) {
    this.waveInfo.start(payload)
  }

  private handleUpdateScore(payload: UpdateScoreEventPayload): void {
    if (payload.playerId === this.mainPlayerId) {
      this.weaponStatus.setCoins(payload.score);
    }
  }

  public spawnPlayer(playerId: string, stateRecord: SyncCollectionRecord<Player.State>): void {
    console.log('spawnPlayer', playerId, stateRecord);
    this.storage.getCollection<Player.State>(playerStateCollection)!.setReadonly(playerId !== this.mainPlayerId, playerId);

    if (this.players.has(playerId)) {
      logger.warn(`Player ${playerId} already exists.`);
      return;
    }

    const player = new PlayerEntity(this, playerId, stateRecord);
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
      if (GAMEOVER && enemy instanceof EnemyEntity && enemy.getPosition().x < 0) {
        this.isGameOver = true;
        this.gameOverView.open({ attempt: this.attempt, time: this.playTime, kills: this.kills });
      }
    });

    // Обрабатываем попадания пуль
    this.projectileController.update(time, delta);
    this.waveInfo.update(time, delta);  

    this.updatePlayerState(time, delta);
    this.updateBossState(time, delta);

    if (!this.isPause) {
      this.playTime += delta;
    }
  }

  private updateBossState(time: number, delta: number): void {
    if (!this.bosses.size) {
      this.waveInfo.showBossProgress(false);
      return;
    }

    let currentHp = 0
    let maxHp = 0

    this.bosses.forEach(boss => {
      const { current, max } = boss.getHealth();
      currentHp += current;
      maxHp += max;
    });

    this.waveInfo.showBossProgress(true);
    this.waveInfo.updateBossProgress(currentHp / maxHp);

    if (currentHp <= 0) {
      this.bosses.clear();
    }
  }

  private updatePlayerState(time: number, delta: number): void {
    const player = this.players.get(this.mainPlayerId)!;
    if (!player) {
      return;
    }
    const state = player.getPlayerState();
    const stateHash = (state.position.x + state.position.y + state.movement.x + state.movement.y).toString();
    if (time - this.lastSentState < 40 || stateHash === this.lastStateHash) {
      return;
    }
    emitEvent(this, Player.Events.State.Local, state);
    this.lastSentState = time;
    this.lastStateHash = stateHash;
  }

  destroy(): void {
    this.clear();
  }

} 