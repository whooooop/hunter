import * as Phaser from 'phaser';
import { hexToNumber } from '../utils/colors';
import { COLORS } from '../core/Constants';
import { WaveStartEventPayload } from '../core/controllers/WaveController';
import { settings } from '../settings';

export class WaveInfo {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Graphics;
  private waveText!: Phaser.GameObjects.Text;
  private startTime: number = 0;
  private duration: number = 0;
  private waveNumber: number = 1;

  private width: number = 322;
  private height: number = 58;
  private offsetY: number = 45;
  private skewX: number = -0.2;
  
  private readonly WAVE_BG_COLOR = hexToNumber(COLORS.INTERFACE_BLOCK_BACKGROUND);
  private readonly PROGRESS_COLOR = hexToNumber('#30444f');
  private readonly TEXT_COLOR = COLORS.INTERFACE_BLOCK_TEXT;
  
  constructor(scene: Phaser.Scene) {
      this.scene = scene;
      this.create();
  }
  
  private create(): void {
      // Создаем контейнер для фона
      const bgContainer = this.scene.add.container(0, 0);
      
      // Создаем основной фон
      const bg = this.scene.add.graphics();
      bg.fillStyle(this.WAVE_BG_COLOR);
      bg.fillRect(-this.width/2, -this.height/2, this.width, this.height);
      
      // Создаем прогресс-бар
      this.progressBar = this.scene.add.graphics();
      this.progressBar.fillStyle(this.PROGRESS_COLOR);
      
      // Создаем текст
      this.waveText = this.scene.add.text(0, 0, 'WAVE', {
          fontFamily: settings.fontFamily,
          fontSize: '40px',
          color: this.TEXT_COLOR
      });
      this.waveText.setOrigin(0.5);
      
      // Добавляем графические объекты в контейнер фона
      bgContainer.add([bg, this.progressBar]);
      
      // Создаем основной контейнер
      this.container = this.scene.add.container(
          this.scene.cameras.main.width / 2,
          this.height / 2 + this.offsetY
      );
      
      // Добавляем все в основной контейнер
      this.container.add([bgContainer, this.waveText]);
      this.container.setDepth(1000);
      
      // Применяем наклон к фоновой графике
      // В Phaser Graphics не имеет прямого метода для skew
      // Создаем трансформацию путем искажения координат при отрисовке
      bg.clear();
      bg.fillStyle(this.WAVE_BG_COLOR);
      
      // Рисуем искаженный прямоугольник (трапецию)
      const skewOffset = this.height * this.skewX; // Смещение для создания эффекта наклона
      bg.beginPath();
      bg.moveTo(-this.width/2 + skewOffset, -this.height/2);
      bg.lineTo(this.width/2 + skewOffset, -this.height/2);
      bg.lineTo(this.width/2 - skewOffset, this.height/2);
      bg.lineTo(-this.width/2 - skewOffset, this.height/2);
      bg.closePath();
      bg.fill();
  }
  
  public update(time: number, delta: number): void {
      const progress = this.getProgress();
      this.progressBar.clear();
      this.progressBar.fillStyle(this.PROGRESS_COLOR);
      
      // Рисуем искаженный прогресс-бар в виде трапеции
      const skewX = -0.2;
      const progressWidth = this.width * (progress / 100);
      const skewOffset = this.height * skewX;
      
      this.progressBar.beginPath();
      this.progressBar.moveTo(-this.width/2 + skewOffset, -this.height/2);
      this.progressBar.lineTo(-this.width/2 + progressWidth + skewOffset, -this.height/2);
      this.progressBar.lineTo(-this.width/2 + progressWidth - skewOffset, this.height/2);
      this.progressBar.lineTo(-this.width/2 - skewOffset, this.height/2);
      this.progressBar.closePath();
      this.progressBar.fill();
  }

  public start(wave: WaveStartEventPayload) {
    this.startTime = this.scene.time.now;
    this.duration = wave.duration;
    this.waveNumber = wave.number;
    
    this.waveText.setText(`WAVE ${this.waveNumber}`);
    
    // Анимируем контейнер при смене волны
    this.animateWaveChange();
  }
  
  /**
   * Анимирует блок с волной при изменении номера волны
   */
  private animateWaveChange(): void {
    // Сохраняем оригинальные значения для восстановления
    const originalScale = { x: this.waveText.scaleX, y: this.waveText.scaleY };
    const originalRotation = this.waveText.rotation;
    
    // Останавливаем предыдущие анимации, если они есть
    this.scene.tweens.killTweensOf(this.waveText);
    
    // Создаем последовательность анимаций
    
    // 1. Анимация увеличения и наклона
    this.scene.tweens.add({
      targets: this.waveText,
      scaleX: originalScale.x * 1.3,
      scaleY: originalScale.y * 1.3,
      rotation: originalRotation - 0.15, // Небольшой наклон
      duration: 350,
      ease: 'Power2',
      onComplete: () => {
        // 2. Анимация возврата к оригинальному состоянию с небольшим отскоком
        this.scene.tweens.add({
          targets: this.waveText,
          scaleX: originalScale.x,
          scaleY: originalScale.y,
          rotation: originalRotation,
          duration: 400,
          ease: 'Elastic.Out',
          easeParams: [1.5, 0.5]
        });
      }
    });
    
    // Добавляем "мигание" текста для дополнительного эффекта
    this.scene.tweens.add({
      targets: this.waveText,
      alpha: 0.7,
      yoyo: true,
      duration: 100,
      repeat: 1,
      ease: 'Linear'
    });
  }
  
  public getProgress(): number {
    if (!this.startTime) {
      return 0;
    }
    const progress = (this.scene.time.now - this.startTime) / this.duration;
    return Math.max(0, Math.min(100, progress * 100));
  }
  
  public destroy(): void {
    this.container.destroy();
  }
} 