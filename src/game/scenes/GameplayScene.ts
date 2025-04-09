import * as Phaser from 'phaser';
import { SceneKeys, PLAYER_POSITION_X, PLAYER_POSITION_Y } from '../core/Constants';
import { Player } from '../entities/Player';
import { BaseEnemy } from '../entities/BaseEnemy';
import { SquirrelEnemy } from '../entities/SquirrelEnemy';
import { BaseBullet } from '../weapons/BaseBullet';
import { ForestLocation } from '../locations/ForestLocation';
import { WaveInfo } from './GameplayScene/components/WaveInfo';
import { settings } from '../settings';
import { createLogger } from '../../utils/logger';
import { createShellCasingTexture } from '../utils/ShellCasingTexture';

const logger = createLogger('GameplayScene');

export class GameplayScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private shellCasings!: Phaser.Physics.Arcade.Group; // Группа для гильз
  private waveInfo!: WaveInfo;
  
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  
  private forestLocation!: ForestLocation;
  
  constructor() {
    super({ key: SceneKeys.GAMEPLAY });
  }
  
  preload(): void {
    // Загрузка ассетов
    this.load.image('player_placeholder', 'public/assets/images/player_placeholder.png');
    this.load.image('enemy_placeholder', 'public/assets/images/enemy_placeholder.png');
    this.load.image('bullet_placeholder', 'public/assets/images/bullet_placeholder.png');
    this.load.image('weapon_placeholder', 'public/assets/images/weapon_placeholder.png');
    this.load.image('background', 'public/assets/images/background.png');
  }
  
  create(): void {
    // Включаем отладку физики, если это указано в настройках
    // Закомментировано для отключения отладочной графики
    // this.physics.world.createDebugGraphic();
    // this.physics.world.debugGraphic.visible = PHYSICS.debug;
    
    // Создаем текстуру гильзы программно
    createShellCasingTexture(this);
    
    // Устанавливаем границы мира
    this.physics.world.setBounds(0, 0, settings.display.width, settings.display.height);
    
    // Создаем локацию (фон будет создан в ForestLocation)
    const forestLocation = new ForestLocation(this);
    forestLocation.create();
    
    // Сохраняем ссылку на локацию для обновления
    this.forestLocation = forestLocation;
    
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
    
    this.enemies = this.physics.add.group({
      classType: BaseEnemy,
      runChildUpdate: true,
      allowGravity: false
    });
    
    // Создаем игрока
    this.player = new Player(this, PLAYER_POSITION_X, PLAYER_POSITION_Y);
    
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
    
    // Создаем UI для счета
    this.scoreText = this.add.text(16, 16, 'Счет: 0', { 
      fontSize: '18px', 
      color: '#fff', 
      fontFamily: 'Arial' 
    });
    
    // Создаем текст для GameOver (скрытый изначально)
    this.gameOverText = this.add.text(
      settings.display.width / 2, 
      settings.display.height / 2, 
      'ИГРА ОКОНЧЕНА', 
      { fontSize: '36px', color: '#ff0000', fontFamily: 'Arial' }
    )
    .setOrigin(0.5)
    .setVisible(false);
    
    // Устанавливаем обработчик события окончания игры
    this.events.on('gameOver', this.onGameOver, this);
    
    // Устанавливаем обработчик события убийства врага
    this.events.on('enemyKilled', this.onEnemyKilled, this);
  }
  
  /**
   * Добавляет созданную гильзу в группу гильз
   * @param shell Спрайт гильзы для добавления в группу
   */
  public addShellCasing(shell: Phaser.Physics.Arcade.Sprite): void {
    this.shellCasings.add(shell);
  }
  
  update(time: number, delta: number): void {
    // Обновляем локацию (анимация травы)
    if (this.forestLocation) {
      this.forestLocation.update(time);
    }
    
    // Обновляем игрока
    if (this.player) {
      this.player.update(time, delta);
    }
  
    // Обновляем всех врагов
    this.enemies.getChildren().forEach(enemySprite => {
      const enemy = (enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemyRef');
      if (enemy && typeof enemy.update === 'function') {
        enemy.update(time, delta);
      }
    });
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
  
  private spawnEnemy(): void {
    // Создаем врага в видимой части экрана для отладки
    // вместо за правой границей экрана
    const x = settings.display.width / 1.5; // Примерно 2/3 экрана справа
    const y = Phaser.Math.Between(50, settings.display.height - 50);
    
    const enemy = new SquirrelEnemy(this, x, y);
    this.enemies.add(enemy.getSprite());
  
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
    
    // Наносим урон игроку
  }
  
  private onEnemyKilled(points: number): void {
    this.score += points;
    this.scoreText.setText(`Счет: ${this.score}`);
  }
  
  private onGameOver(isVictory: boolean): void {
    // Останавливаем спавн врагов
    this.enemySpawnTimer.remove();
    
    // Останавливаем все объекты
    this.physics.pause();
    
    // Показываем сообщение
    const message = isVictory ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА';
    this.gameOverText.setText(message);
    this.gameOverText.setVisible(true);
    
    // Добавляем кнопку перезапуска через 2 секунды
    this.time.delayedCall(2000, () => {
      const restartButton = this.add.text(
        settings.display.width / 2,
        settings.display.height / 2 + 50,
        'Нажмите для перезапуска',
        { fontSize: '24px', color: '#fff', fontFamily: 'Arial' }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.restart();
      });
    });
  }
} 