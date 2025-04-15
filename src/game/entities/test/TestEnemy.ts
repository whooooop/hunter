// https://en.esotericsoftware.com/spine-phaser
// https://medium.com/@tajammalmaqbool11/phaser-js-and-spine-2d-a-great-combination-for-game-development-2a22912a8265


// import atlasUrl from './assets/knight3.atlas';
// import jsonUrl from './assets/knight3.json';
// import textureUrl from './assets/knight3.atlas.png';

import atlasUrl from './assets/ConvertedPNG8.atlas';
import jsonUrl from './assets/ConvertedPNG8.json';
import textureUrl from './assets/ConvertedPNG8.atlas.png';

import { EnemyEntity } from '../../core/entities/EnemyEntity';
import { generateStringWithLength } from '../../../utils/stringGenerator';

// Константы для анимаций
const TEXTURE_KEY = 'test-enemy-' + generateStringWithLength(6);
const ATLAS_KEY = 'test-enemy-atlas-' + generateStringWithLength(6);

// Ключи анимаций 
const ANIM = {
  IDLE: 'Idle',
  ATTACK: 'Attack',
  DEATH: 'Death'
};

export class TestEnemy {
  private currentAnimation: string = ANIM.IDLE;
  private attackTimer: Phaser.Time.TimerEvent | null = null;
  private attackRange: number = 200; // Дистанция атаки
  private movementSpeed: number = 70; // Скорость движения
  private gameObject!: Phaser.GameObjects.Sprite;

  static preload(scene: Phaser.Scene) {
    // Загружаем текстуру и atlas
    // scene.load.image(TEXTURE_KEY, texture);
    // scene.load.spineBinary('boy', json);
    console.log(jsonUrl, textureUrl);
    scene.load.spineJson('skeleton-data', jsonUrl)
    scene.load.spineAtlas('skeleton-atlas', atlasUrl)
    // scene.load.spine(ATLAS_KEY, jsonUrl, atlasUrl);
    // scene.load.spineJson('skeleton-data', json);
    // scene.load.spineAtlas('skeleton-atlas', atlas, true);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {

    const spineObject = scene.add.spine(x, y, 'skeleton-data', 'skeleton-atlas');
    spineObject.setDepth(100);
    spineObject.setScale(0.5);
    spineObject.animationState.setAnimation(0, 'Idle', true);
    // scene.physics.add.existing(spineObject);

    return;
 
    this.gameObject = scene.physics.add.sprite(x, y, TEXTURE_KEY, );
    
    // Настраиваем физические свойства
    // 
    // this.gameObject.setCollideWorldBounds(true);
    // this.gameObject.setSize(this.gameObject.width * 0.7, this.gameObject.height * 0.8);
    this.gameObject.setSize(this.gameObject.width, this.gameObject.height);
    // this.gameObject.setScale(0.5);
    // Начинаем поведение
    // this.startBehavior(scene);

    scene.add.existing(this.gameObject);
  }
  
  /**
   * Запускает воспроизведение анимации
   */
  private playAnimation(animName: string, ignoreIfPlaying: boolean = true): void {
    const fullKey = `${ATLAS_KEY}-${animName}`;
    
    // Проверяем, проигрывается ли уже эта анимация
    if (ignoreIfPlaying && this.currentAnimation === animName && this.gameObject.anims.isPlaying) {
      return;
    }
    
    // Сохраняем имя текущей анимации
    this.currentAnimation = animName;
    
    // Запускаем анимацию
    this.gameObject.play(fullKey);
    
    // Добавляем обработчики событий для определенных анимаций
    if (animName === ANIM.ATTACK) {
      this.gameObject.once('animationcomplete', () => {
        // После завершения атаки возвращаемся к простою
        this.playAnimation(ANIM.IDLE);
      });
    } else if (animName === ANIM.DEATH) {
      this.gameObject.once('animationcomplete', () => {
        // После анимации смерти удаляем объект
        setTimeout(() => {
          // this.destroy();
        }, 1000); // Задержка перед удалением
      });
    }
  }
  
  /**
   * Запускает поведение персонажа
   */
  // private startBehavior(scene: Phaser.Scene): void {
  //   // Начинаем перемещение
  //   this.motionController.setMove(-1, 0);
  //   this.playAnimation(ANIM.IDLE);
    
  //   // Таймер для случайных атак
  //   this.attackTimer = scene.time.addEvent({
  //     delay: 3000, // Интервал проверки атаки
  //     callback: this.checkPlayerDistance,
  //     callbackScope: this,
  //     loop: true
  //   });
  // }
  
  /**
   * Проверяет расстояние до игрока и атакует, если он в пределах дистанции атаки
   */
  // private checkPlayerDistance(): void {
  //   // Находим игрока в сцене через registry
  //   const scene = this.gameObject.scene;
  //   const player = scene.registry.get('player');
    
  //   if (!player) return;
    
  //   // Получаем позицию игрока
  //   const playerPosition = player.getPosition();
    
  //   if (!playerPosition) return;
    
  //   // Вычисляем расстояние до игрока
  //   const distance = Phaser.Math.Distance.Between(
  //     this.gameObject.x, this.gameObject.y,
  //     playerPosition[0], playerPosition[1]
  //   );
    
  //   // Определяем направление к игроку
  //   const direction = playerPosition[0] < this.gameObject.x ? -1 : 1;
    
  //   // Поворачиваем спрайт в сторону игрока
  //   this.gameObject.setFlipX(direction === 1);
    
  //   // Если игрок в пределах дистанции атаки, атакуем
  //   if (distance < this.attackRange) {
  //     // Останавливаем движение
  //     this.motionController.setMove(0, 0);
      
  //     // Запускаем анимацию атаки
  //     this.playAnimation(ANIM.ATTACK, false);
      
  //     // Задаем паузу в движении
  //     const scene = this.sprite.scene;
  //     scene.time.delayedCall(1000, () => {
  //       // Возобновляем движение после атаки, если не мертв
  //       if (!this.getDead()) {
  //         this.motionController.setMove(direction, 0);
  //         this.playAnimation(ANIM.IDLE);
  //       }
  //     });
  //   } else {
  //     // Если игрок не в зоне атаки, двигаемся в его сторону
  //     this.motionController.setMove(direction, 0);
  //     this.playAnimation(ANIM.IDLE);
  //   }
  // }
  
  /**
   * Переопределяем метод takeDamage для проигрывания анимации получения урона
   */
  // public takeDamage(damage: any): void {
  //   super.takeDamage(damage);
    
  //   if (this.getDead()) {
  //     // Если персонаж умер, проигрываем анимацию смерти
  //     this.playAnimation(ANIM.DEATH, false);
      
  //     // Останавливаем движение и поведение
  //     this.motionController.setMove(0, 0);
  //     if (this.attackTimer) {
  //       this.attackTimer.remove();
  //       this.attackTimer = null;
  //     }
  //   } else {
  //     // Если персонаж жив, проигрываем анимацию получения урона
  //     this.playAnimation(ANIM.IDLE, false);
      
  //     // Останавливаем движение на короткое время
  //     this.motionController.setMove(0, 0);
  //   }
  // }
  
  /**
   * Обновление состояния персонажа
   */
  // public update(time: number, delta: number): void {
  //   super.update(time, delta);
    
  //   // Если персонаж мертв, не обновляем поведение
  //   if (this.getDead()) return;
    
  //   // Дополнительная логика обновления может быть добавлена здесь
  // }
  
  /**
   * Очистка ресурсов при уничтожении
   */
  // public destroy(): void {
  //   if (this.attackTimer) {
  //     this.attackTimer.remove();
  //     this.attackTimer = null;
  //   }
    
  //   super.destroy();
  // }
}
