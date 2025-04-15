import explosionTextureUrl from '../../../assets/images/explosion.png';

const texture = {
  key: 'explosion_texture_0',
  url: explosionTextureUrl,
  frameWidth: 250,
  frameHeight: 250,
  scale: 0.8,
  frameRate: 30,
  frameCount: 9
}

export class ExplosionEntity {
  private gameObject: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private isDestroyed: boolean = false;
  private animationKey: string;

  /**
   * Предзагрузка ресурсов для взрыва
   */
  static preload(scene: Phaser.Scene) {
    scene.load.spritesheet(texture.key, texture.url, { 
      frameWidth: texture.frameWidth, 
      frameHeight: texture.frameHeight 
    });
  }

  /**
   * Создает взрыв в указанной позиции
   */
  static create(scene: Phaser.Scene, x: number, y: number, scale: number = texture.scale): ExplosionEntity {
    return new ExplosionEntity(scene, x, y, scale);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, scale: number = texture.scale) {
    this.scene = scene;
    this.animationKey = `explosion_anim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Создаем спрайт
    this.gameObject = scene.add.sprite(x, y, texture.key);
    this.gameObject.setScale(scale);
    this.gameObject.setDepth(1000);
    this.gameObject.setOrigin(0.5, 1);
    
    // Создаем анимацию взрыва, если она еще не создана
    this.createExplosionAnimation();
    
    // Запускаем анимацию взрыва
    this.playExplosionAnimation();
  }

  /**
   * Создает анимацию взрыва
   */
  private createExplosionAnimation(): void {
    // Проверяем, существует ли уже анимация с таким ключом
    if (!this.scene.anims.exists(this.animationKey)) {
      // Создаем массив фреймов
      const frames = this.scene.anims.generateFrameNumbers(texture.key, {
        start: 0,
        end: texture.frameCount - 1
      });
      
      // Создаем конфигурацию анимации
      const config: Phaser.Types.Animations.Animation = {
        key: this.animationKey,
        frames: frames,
        frameRate: texture.frameRate,
        repeat: 0, // Без повторений, проигрываем один раз
      };
      
      // Создаем анимацию
      this.scene.anims.create(config);
    }
  }
  
  /**
   * Запускает анимацию взрыва и настраивает callback для удаления по завершении
   */
  private playExplosionAnimation(): void {
    // Запускаем анимацию
    this.gameObject.play(this.animationKey);
    
    // Добавляем обработчик события завершения анимации
    this.gameObject.once('animationcomplete', () => {
      this.destroy();
    });
  }
  
  /**
   * Проверяет, был ли уничтожен объект
   */
  public getDestroyed(): boolean {
    return this.isDestroyed;
  }
  
  /**
   * Уничтожает объект взрыва
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    // Останавливаем анимацию
    this.gameObject.anims.stop();
    
    // Уничтожаем спрайт
    this.gameObject.destroy();
    
    // Помечаем объект как уничтоженный
    this.isDestroyed = true;
  }
  
  /**
   * Устанавливает глубину отображения (z-index) спрайта взрыва
   */
  public setDepth(depth: number): this {
    this.gameObject.setDepth(depth);
    return this;
  }
}