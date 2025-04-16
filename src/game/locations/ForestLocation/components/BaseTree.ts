import { createLogger } from '../../../../utils/logger';
import { generateStringWithLength } from '../../../../utils/stringGenerator';

import leafImage from '../assets/images/leaf.png';
import woodChipImage from '../assets/images/wood_chip.png';
import { Demage } from '../../../core/types/demage';
import { DecorEntity } from '../../../core/entities/DecorEntity';
import { DamageResult } from '../../../core/entities/DamageableEntity';

const logger = createLogger('Tree');

const TEXTURE_WOOOD_CHIP = 'tree_wood_chop' + generateStringWithLength(6);
const TEXTURE_WOOOD_LEAF = 'tree_leaf' + generateStringWithLength(6);

interface ParticleEffectOptions {
    texture: string;
    count: number;
    hitX: number;
    hitY: number;
    gravity: number;
    angle: number[];
    speed: number[];
    duration: number;
}

interface TreeOptions {
    depthOffset?: number;
    scale: number;
    health: number;
    texture: string;
}

export class BaseTree extends DecorEntity {
  protected scene: Phaser.Scene;
  protected frameIndex: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, options: TreeOptions) {
    const gameObject = scene.physics.add.sprite(x, y, options.texture, 0).setScale(options.scale);
    super(gameObject, { health: options.health });
    
    this.scene = scene;
    this.scene.add.existing(this.gameObject);
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.image(TEXTURE_WOOOD_CHIP, woodChipImage);
    scene.load.image(TEXTURE_WOOOD_LEAF, leafImage);
  }

  /**
   * Обработка получения урона
   */
  public takeDamage(damage: Demage): DamageResult | null {
    const result = super.takeDamage(damage);

    if (!result) return null;

    // Обновляем визуальное состояние объекта
    this.updateVisualState();

    if (result.health <= 0) {
      // Отключаем автоматический вызов preUpdate для этого объекта
      this.gameObject.setActive(false);
      // Оставляем объект видимым
      this.gameObject.setVisible(true);
    } else {
      this.createHitParticles();
    }

    return result;
  }

  /**
   * Обновляет визуальное состояние дерева в зависимости от текущего здоровья
   */
  private updateVisualState(): void {
      const healthPercent = this.getHealthPercent();
      this.frameIndex = this.calculateFrameIndex(healthPercent);
      this.gameObject.setFrame(this.frameIndex);
  }

  protected calculateFrameIndex(healthPercent: number): number {
    // При 100% здоровья (healthPercent = 1) должен быть кадр 0 (первый)
    // При 0% здоровья (healthPercent = 0) должен быть кадр 4 (последний)
    
    if (healthPercent >= 0.8) {
        return 0; // 80-100% здоровья - первый кадр (неповрежденное)
    } else if (healthPercent >= 0.6) {
        return 1; // 60-80% здоровья - второй кадр (слегка поврежденное)
    } else if (healthPercent >= 0.4) {
        return 2; // 40-60% здоровья - третий кадр (умеренно поврежденное)
    } else if (healthPercent > 0) {
        return 3; // 20-40% здоровья - четвертый кадр (сильно поврежденное)
    } else {
        return 4; // 0-20% здоровья - пятый кадр (разрушенное) 
    }
  }
    
  /**
   * Создает частицы, имитирующие разлетающиеся щепки и листья при попадании
   * Используем прямой подход со спрайтами вместо системы частиц
   */
  private createHitParticles(): void {
    const healthPercent = this.getHealthPercent();

    // Небольшое количество частиц
    const woodChipCount = healthPercent > 0.4 ? 0 : healthPercent > 0.1 ? 4 : 1;
    const leafCount = healthPercent > 0.4 ? 4 : 0;
    
    // Определяем точку удара - немного смещение от центра для реалистичности
    const hitX = this.gameObject.x + Phaser.Math.Between(-10, 10);
    const hitY = this.gameObject.y + Phaser.Math.Between(-10, 10);
    
    this.createParticles({
        texture: TEXTURE_WOOOD_CHIP,
        count: woodChipCount,
        hitX,
        hitY,
        gravity: 300,
        angle: [10, 350],
        speed: [50, 150],
        duration: 600
    });

    this.createParticles({
        texture: TEXTURE_WOOOD_LEAF,
        count: leafCount,
        hitX,
        hitY,
        gravity: 120,
        angle: [-30, 210],
        speed: [30, 80],
        duration: 1000
    });
  }

  private createParticles(options: ParticleEffectOptions): void {
    for (let i = 0; i < options.count; i++) {
      const particle = this.scene.physics.add.sprite(options.hitX, options.hitY, options.texture);
      
      // Настраиваем размер и глубину для лучшей видимости
      // particle.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
      particle.setDepth(100);
      
      // Случайный поворот для разнообразия
      particle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      
      // Разлетаются преимущественно вниз и в стороны
      const angle = Phaser.Math.Between(options.angle[0], options.angle[1]) * Math.PI / 180;
      const speed = Phaser.Math.Between(50, 150);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      // Применяем скорость и гравитацию
      particle.setVelocity(velocityX, velocityY);
      particle.setGravityY(options.gravity);
      
      // Вращение в полете
      particle.setAngularVelocity(Phaser.Math.Between(-90, 90));
  
      // Анимация исчезновения
      this.scene.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 0.5,
          duration: options.duration,
          onComplete: () => {
              particle.destroy();
          }
      });
    }
  }
}