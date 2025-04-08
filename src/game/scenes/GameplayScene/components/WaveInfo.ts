import * as Phaser from 'phaser';
import { hexToRgb } from '../../../../utils/colors';

export class WaveInfo {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private progressBar!: Phaser.GameObjects.Graphics;
    private waveText!: Phaser.GameObjects.Text;
    private waveProgress: number = 20;
    
    private readonly WAVE_BG_COLOR = hexToRgb('#06232d');
    private readonly PROGRESS_COLOR = hexToRgb('#30444f');
    private readonly TEXT_COLOR = '#ffffff';
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.create();
        this.update();
    }
    
    private create(): void {
        const width = 200;
        const height = 40;
        
        // Создаем контейнер для фона
        const bgContainer = this.scene.add.container(0, 0);
        
        // Создаем основной фон
        const bg = this.scene.add.graphics();
        bg.fillStyle(this.WAVE_BG_COLOR);
        bg.fillRect(-width/2, -height/2, width, height);
        
        // Создаем прогресс-бар
        this.progressBar = this.scene.add.graphics();
        this.progressBar.fillStyle(this.PROGRESS_COLOR);
        
        // Создаем текст
        this.waveText = this.scene.add.text(0, 0, 'WAVE 1', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: this.TEXT_COLOR
        });
        this.waveText.setOrigin(0.5);
        
        // Добавляем графические объекты в контейнер фона
        bgContainer.add([bg, this.progressBar]);
        
        // Создаем основной контейнер
        this.container = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            30
        );
        
        // Добавляем все в основной контейнер
        this.container.add([bgContainer, this.waveText]);
        this.container.setDepth(1000);
        
        // Применяем наклон к фоновой графике
        const skewX = -0.2;
        // В Phaser Graphics не имеет прямого метода для skew
        // Создаем трансформацию путем искажения координат при отрисовке
        bg.clear();
        bg.fillStyle(this.WAVE_BG_COLOR);
        
        // Рисуем искаженный прямоугольник (трапецию)
        const skewOffset = height * skewX; // Смещение для создания эффекта наклона
        bg.beginPath();
        bg.moveTo(-width/2 + skewOffset, -height/2);
        bg.lineTo(width/2 + skewOffset, -height/2);
        bg.lineTo(width/2 - skewOffset, height/2);
        bg.lineTo(-width/2 - skewOffset, height/2);
        bg.closePath();
        bg.fill();
    }
    
    public update(): void {
        const width = 200;
        const height = 40;
        
        this.progressBar.clear();
        this.progressBar.fillStyle(this.PROGRESS_COLOR);
        
        // Рисуем искаженный прогресс-бар в виде трапеции
        const skewX = -0.2;
        const progressWidth = width * (this.waveProgress / 100);
        const skewOffset = height * skewX;
        
        this.progressBar.beginPath();
        this.progressBar.moveTo(-width/2 + skewOffset, -height/2);
        this.progressBar.lineTo(-width/2 + progressWidth + skewOffset, -height/2);
        this.progressBar.lineTo(-width/2 + progressWidth - skewOffset, height/2);
        this.progressBar.lineTo(-width/2 - skewOffset, height/2);
        this.progressBar.closePath();
        this.progressBar.fill();
    }
    
    public setProgress(progress: number): void {
        this.waveProgress = Math.max(0, Math.min(100, progress));
    }
    
    public getProgress(): number {
        return this.waveProgress;
    }
    
    public setWaveNumber(wave: number): void {
        this.waveText.setText(`WAVE ${wave}`);
    }
    
    public destroy(): void {
        this.container.destroy();
    }
} 