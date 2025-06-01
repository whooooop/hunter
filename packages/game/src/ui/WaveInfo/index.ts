import { StorageSpace, SyncCollection, SyncCollectionRecord } from '@hunter/multiplayer/dist/client';
import { WaveState } from '@hunter/storage-proto/dist/storage';
import * as Phaser from 'phaser';
import { FONT_FAMILY } from '../../config';
import { COLORS } from '../../Constants';
import { waveStateCollection } from '../../storage/collections/waveState.collection';
import { hexToNumber } from '../../utils/colors';
import { CustomPauseButton } from '../CustomPauseButton';
import { bossText, waveText } from './translate';

export class WaveInfo {
  private container!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Graphics;
  private waveText!: Phaser.GameObjects.Text;
  private pauseButton!: CustomPauseButton;
  private progress: number = 0;
  private progressTarget: number = 0;
  private waveNumber: number = 1;

  private width: number = 322;
  private height: number = 58;
  private offsetY: number = 45;
  private skewX: number = -0.2;

  private readonly WAVE_BG_COLOR = hexToNumber(COLORS.INTERFACE_BLOCK_BACKGROUND);
  private readonly PROGRESS_COLOR = hexToNumber('#30444f');
  private readonly TEXT_COLOR = COLORS.INTERFACE_BLOCK_TEXT;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly storage: StorageSpace
  ) {
    this.storage.on<WaveState>(waveStateCollection, 'Update', this.updateWaveState.bind(this));
    this.storage.on<WaveState>(waveStateCollection, 'Add', this.updateWaveState.bind(this));

    this.create();
  }

  private updateWaveState(id: string, record: SyncCollectionRecord<WaveState>, collection: SyncCollection<WaveState>): void {
    const waveNumber = record.data.waveIndex + 1;
    this.progressTarget = record.data.progress;

    if (record.data.boss) {
      this.waveText.setText(`${bossText.translate.toUpperCase()}`);
      this.progress = record.data.progress;
    } else {
      this.waveText.setText(`${waveText.translate.toUpperCase()} ${waveNumber}`);
    }

    if (this.waveNumber !== waveNumber) {
      this.waveText.setText(`${waveText.translate.toUpperCase()} ${waveNumber}`);
      this.animateWaveChange();
      this.waveNumber = waveNumber;
      this.progress = 0;
    }
  }

  private create(): void {
    // Создаем контейнер для фона
    const bgContainer = this.scene.add.container(0, 0);

    // Создаем основной фон
    const bg = this.scene.add.graphics();
    bg.fillStyle(this.WAVE_BG_COLOR);
    bg.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Создаем прогресс-бар
    this.progressBar = this.scene.add.graphics();
    this.progressBar.fillStyle(this.PROGRESS_COLOR);

    // Создаем текст
    this.waveText = this.scene.add.text(0, 0, waveText.translate.toUpperCase(), {
      fontFamily: FONT_FAMILY.BOLD,
      fontSize: '40px',
      color: this.TEXT_COLOR
    });
    this.waveText.setOrigin(0.5);

    // Добавляем графические объекты в контейнер фона
    bgContainer.add([bg, this.progressBar]);

    // Создаем кнопку паузы
    this.pauseButton = new CustomPauseButton(this.scene, -this.width / 2 + 36, 0);

    // Создаем основной контейнер
    this.container = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      this.height / 2 + this.offsetY
    );

    // Добавляем все в основной контейнер
    this.container.add([bgContainer, this.waveText, this.pauseButton]);
    this.container.setDepth(1000);

    // Применяем наклон к фоновой графике
    // В Phaser Graphics не имеет прямого метода для skew
    // Создаем трансформацию путем искажения координат при отрисовке
    bg.clear();
    bg.fillStyle(this.WAVE_BG_COLOR);

    // Рисуем искаженный прямоугольник (трапецию)
    const skewOffset = this.height * this.skewX; // Смещение для создания эффекта наклона
    bg.beginPath();
    bg.moveTo(-this.width / 2 + skewOffset, -this.height / 2);
    bg.lineTo(this.width / 2 + skewOffset, -this.height / 2);
    bg.lineTo(this.width / 2 - skewOffset, this.height / 2);
    bg.lineTo(-this.width / 2 - skewOffset, this.height / 2);
    bg.closePath();
    bg.fill();
  }

  public update(time: number, delta: number): void {
    this.progressBar.clear();
    this.progressBar.fillStyle(this.PROGRESS_COLOR);

    this.progress = Phaser.Math.Interpolation.Linear([this.progress, this.progressTarget], 0.01);
    // Рисуем искаженный прогресс-бар в виде трапеции
    const skewX = -0.2;
    const progressWidth = this.width * (this.progress / 100);
    const skewOffset = this.height * skewX;

    this.progressBar.beginPath();
    this.progressBar.moveTo(-this.width / 2 + skewOffset, -this.height / 2);
    this.progressBar.lineTo(-this.width / 2 + progressWidth + skewOffset, -this.height / 2);
    this.progressBar.lineTo(-this.width / 2 + progressWidth - skewOffset, this.height / 2);
    this.progressBar.lineTo(-this.width / 2 - skewOffset, this.height / 2);
    this.progressBar.closePath();
    this.progressBar.fill();
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
      ease: Phaser.Math.Easing.Bounce.Out,
      onComplete: () => {
        // 2. Анимация возврата к оригинальному состоянию с небольшим отскоком
        this.scene.tweens.add({
          targets: this.waveText,
          scaleX: originalScale.x,
          scaleY: originalScale.y,
          rotation: originalRotation,
          duration: 400,
          ease: Phaser.Math.Easing.Bounce.Out,
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

  public destroy(): void {
    this.pauseButton?.destroy(); // Очищаем кнопку паузы
    this.container.destroy();
  }
} 