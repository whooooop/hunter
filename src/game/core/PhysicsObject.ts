import * as Phaser from 'phaser';

// Интерфейс для настроек отладки
export interface DebugSettings {
  enabled: boolean;
  showPositions: boolean;
  showPhysics: boolean;
  showSprites: boolean;
  logCreation: boolean;
  showPath: boolean;
}

export class PhysicsObject {
  protected scene: Phaser.Scene;
  protected sprite: Phaser.Physics.Arcade.Sprite;
  protected name: string = 'PhysicsObject';

  protected velocityX: number = 0;     // Текущая скорость по X
  protected velocityY: number = 0;     // Текущая скорость по Y
  protected friction: number = 0;      // Трение (замедление при движении)

  protected debugObjects: Phaser.GameObjects.GameObject[] = [];
  protected debugTexts: {[key: string]: Phaser.GameObjects.Text} = {};
  protected debugGraphics: {[key: string]: Phaser.GameObjects.Graphics} = {};

  protected x: number = 0;
  protected y: number = 0;
  protected acceleration: number = 1;
  protected deceleration: number = 0.5;
  protected direction: number = 1;

  protected moveX: number = 0;
  protected moveY: number = 0;
  protected maxVelocityX: number = 20;
  protected maxVelocityY: number = 5;

  // Настройки отладки для каждого объекта
  protected debug: DebugSettings = {
    enabled: true,
    showPositions: true,
    showPhysics: true,
    showSprites: true,
    logCreation: true,
    showPath: true
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'enemy_placeholder');
    
    this.setupPhysics();

    if (this.debug.enabled) {
      this.setupDebug();
    }
    
    if (this.debug.logCreation) {
      console.log(`PhysicsObject создан: ${this.name} на позиции (${x}, ${y})`);
    }
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
  
  protected setupPhysics(): void {
    // Базовая настройка физики
    this.sprite.setCollideWorldBounds(true);
    
    // Добавляем имя объекта для отладки
    this.sprite.setName(this.name);
    
    // Делаем спрайт видимым
    if (this.debug.showSprites) {
      this.sprite.setVisible(true);
    }
    
    // Устанавливаем глубину отображения
    this.sprite.setDepth(10);
    
    // Включаем отображение тела для отладки, если включен режим отладки
    if (this.debug.showPhysics && this.scene.physics.world.drawDebug) {
      // В Phaser 3 отладка физики включается на уровне мира, а не отдельных объектов
      this.scene.physics.world.debugGraphic.visible = true;
    }
  }

  // Главный метод настройки отладки
  protected setupDebug(): void {
    // Создаем базовые элементы отладки
    this.addDebugPosition();
    
    // Добавляем отладочные линии пути, если включено
    if (this.debug.showPath) {
      this.addDebugPath();
    }
  }
  
    // Добавляем отладочные линии пути перемещения
  protected addDebugPath(): void {
    if (!this.debug.showPath) return;
    
    const lineGraphics = this.scene.add.graphics();
    lineGraphics.lineStyle(2, 0xff0000, 1);
    lineGraphics.lineBetween(this.x, this.y, this.x - 50, this.y);
    lineGraphics.setDepth(110);
    this.debugObjects.push(lineGraphics);
    this.debugGraphics['path'] = lineGraphics;
  }

  // Добавляем отображение позиции
  protected addDebugPosition(): void {
    if (!this.debug.showPositions) return;

    // Добавляем отладочный круг на позиции объекта
    const debugCircle = this.scene.add.circle(this.x, this.y, 10, 0xff0000, 0.7);
    debugCircle.setDepth(100);
    this.debugObjects.push(debugCircle);
  
    // Добавляем текст с именем объекта и координатами
    const debugText = this.scene.add.text(this.x, this.y, `${this.name} (${Math.floor(this.x)},${Math.floor(this.y)})`, {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    debugText.setDepth(100);
    this.debugObjects.push(debugText);
    this.debugTexts['position'] = debugText;
  }

  public update(time: number, delta: number): void {
    // Обрабатываем движение с ускорением
    this.handleMovementWithAcceleration();

    // Применяем трение при движении (дополнительное замедление)
    if (Math.abs(this.velocityX) > 0 && this.friction > 0) {
      const frictionX = Math.min(Math.abs(this.velocityX), this.friction) * Math.sign(this.velocityX);
      this.velocityX -= frictionX;
    }
    
    if (Math.abs(this.velocityY) > 0 && this.friction > 0) {
      const frictionY = Math.min(Math.abs(this.velocityY), this.friction) * Math.sign(this.velocityY);
      this.velocityY -= frictionY;
    }

    // Обновляем позицию игрока на основе текущей скорости
    this.x += this.velocityX * (delta / 1000);
    this.y += this.velocityY * (delta / 1000);
    
    // Устанавливаем позицию спрайта
    this.sprite.setPosition(this.x, this.y);

    if (this.debug.enabled) {
      this.updateDebugVisuals();
    }
  }

  private handleMovementWithAcceleration(): void {
    if (this.moveX < 0) {
      // Ускорение влево
      this.velocityX = Math.max(this.velocityX - this.acceleration, -this.maxVelocityX);
    } else if (this.moveX > 0) {
      // Ускорение вправо
      this.velocityX = Math.min(this.velocityX + this.acceleration, this.maxVelocityX);
    } else {
      // Замедление по X с инерцией
      if (this.velocityX > 0) {
        this.velocityX = Math.max(this.velocityX - this.deceleration, 0);
      } else if (this.velocityX < 0) {
        this.velocityX = Math.min(this.velocityX + this.deceleration, 0);
      }
    }
    
    // Обрабатываем движение по вертикали с ускорением
    if (this.moveY < 0) {
      // Ускорение вверх
      this.velocityY = Math.max(this.velocityY - this.acceleration, -this.maxVelocityY);
    } else if (this.moveY > 0) {
      // Ускорение вниз
      this.velocityY = Math.min(this.velocityY + this.acceleration, this.maxVelocityY);
    } else {
      // Замедление по Y с инерцией
      if (this.velocityY > 0) {
        this.velocityY = Math.max(this.velocityY - this.deceleration, 0);
      } else if (this.velocityY < 0) {
        this.velocityY = Math.min(this.velocityY + this.deceleration, 0);
      }
    }
  }
  
  // Обновляем позицию отладочных объектов
  protected updateDebugVisuals(): void {
    // Обновляем основной позиционный текст
    const positionText = this.debugTexts['position'];
    if (positionText) {
      positionText.setPosition(this.x, this.y - 20);
      positionText.setText(`${this.name} (${Math.floor(this.x)},${Math.floor(this.y)})`);
    }

    // Обновляем первый дебаг-объект (круг)
    if (this.debugObjects.length > 0 && this.debug.showPositions) {
      const circle = this.debugObjects[0] as Phaser.GameObjects.Arc;
      if (circle) {
        circle.setPosition(this.x, this.y);
      }
    }
    
    // Обновляем пути перемещения
    if (this.debug.showPath) {
      const pathGraphics = this.debugGraphics['path'];
      if (pathGraphics) {
        pathGraphics.clear();
        pathGraphics.lineStyle(2, 0xff0000, 1);
        pathGraphics.lineBetween(this.x, this.y, this.x + this.direction * 50, this.y);
      }
    }
  }

  public destroy(): void {
    // Удаляем отладочные объекты
    this.debugObjects.forEach(obj => obj.destroy());
    
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 