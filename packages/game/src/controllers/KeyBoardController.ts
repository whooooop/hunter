import { StorageSpace } from "@hunter/multiplayer";
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import { DISPLAY, FONT_FAMILY } from "../config";
import { emitEvent } from "../GameEvents";
import { JoystickBaseTexture, JoystickThumbTexture, preloadJoystickTextures } from "../textures/joystick";
import { Game } from "../types/";
import { Controls } from "../types/ControlsTypes";
import { hexToNumber } from "../utils/colors";
import { I18n } from "../utils/i18n";

const textColor = '#343434';
const dashedColor = '#a9c5b4';

const fireText = I18n({
  en: 'Fire',
  ru: 'Огонь'
});

const jumpText = I18n({
  en: 'Jump',
  ru: 'Прыжок'
});

const changeWeaponText = I18n({
  en: 'Swipe left or right for weapon change',
  ru: 'Проведите пальцем, влево или вправо, для смены оружия'
});

const minThreshold = 0.25;

export class KeyBoardController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private UpKey: Phaser.Input.Keyboard.Key;
  private DownKey: Phaser.Input.Keyboard.Key;
  private LeftKey: Phaser.Input.Keyboard.Key;
  private RightKey: Phaser.Input.Keyboard.Key;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private nextWeaponKey: Phaser.Input.Keyboard.Key;
  private prevWeaponKey: Phaser.Input.Keyboard.Key;
  private pauseKey: Phaser.Input.Keyboard.Key;
  private shopKey: Phaser.Input.Keyboard.Key;
  private key1: Phaser.Input.Keyboard.Key;
  private key2: Phaser.Input.Keyboard.Key;
  private key3: Phaser.Input.Keyboard.Key;
  private key4: Phaser.Input.Keyboard.Key;
  private key5: Phaser.Input.Keyboard.Key;
  private key6: Phaser.Input.Keyboard.Key;
  private key7: Phaser.Input.Keyboard.Key;
  private key8: Phaser.Input.Keyboard.Key;
  private key9: Phaser.Input.Keyboard.Key;
  private joystick!: VirtualJoystick;
  private joystickRadius: number = 100;

  private changeWeaponKeyDisabled: boolean = false;
  private pauseKeyDisabled: boolean = false;
  private jumpAreaDisabled: boolean = false;
  private shopKeyDisabled: boolean = false;
  private keyUpDisabled: boolean = false;
  private keyDownDisabled: boolean = false;
  private keyLeftDisabled: boolean = false;
  private keyRightDisabled: boolean = false;
  private fireKeyPressed: boolean = false;
  private firePointerPressed: boolean = false;
  private numberKeyPressed: number = 0;


  private isJoystickActive: boolean = false;

  private dashedTimeout: number = 7000;

  public static preload(scene: Phaser.Scene): void {
    preloadJoystickTextures(scene);
  }

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly playerId: string,
    private readonly storage: StorageSpace
  ) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.UpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.DownKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.LeftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.RightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.nextWeaponKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.prevWeaponKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shopKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.key1 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.key5 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
    this.key6 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
    this.key7 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);
    this.key8 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);
    this.key9 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);

    if (!this.scene.sys.game.device.os.desktop) {
      this.createMobileControls();
    }
  }

  private createMobileControls(): void {
    // jump

    this.createJoystick();
    this.createChangeWeaponArea();
    this.createFireArea();



    // jump area rectangle
    // const jumpAreaOffsetY = DISPLAY.HEIGHT / 2;
    // const jumpAreaOffsetX = DISPLAY.WIDTH / 1.5;
    // const jumpArea = this.scene.add.rectangle(jumpAreaOffsetX, jumpAreaOffsetY, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - jumpAreaOffsetY, hexToNumber('#343434'), 0.4).setOrigin(0, 0);
    // jumpArea.setDepth(1000);
    // jumpArea.setInteractive();
    // jumpArea.on('pointerdown', () => {
    //   console.log('jump area clicked');
    // });
  }

  private createPointer(x: number, y: number, text: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const textElement = this.scene.add.text(0, 0, text.toUpperCase(), {
      fontSize: '24px',
      fontFamily: FONT_FAMILY.BOLD,
      color: textColor.toString()
    }).setOrigin(0.5);
    const pointer = this.scene.add.image(0, 0, JoystickThumbTexture.key)
      .setScale(0.7)
      .setAlpha(0.8)
    container.add([textElement, pointer]);
    container.setDepth(1000);
    return container;
  }

  private createJoystick(): void {
    const x = 0;
    const y = DISPLAY.HEIGHT / 3.4;
    const width = DISPLAY.WIDTH / 2;
    const height = DISPLAY.HEIGHT - y;
    const offset = 20;
    const depth = 1000;
    const moveAreaOffsetY = 250;
    const moveArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0, 0);
    moveArea.setDepth(depth);
    moveArea.setInteractive();
    moveArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.joystick.visible = true;
      this.isJoystickActive = true;
      this.joystick.setPosition(pointer.x, pointer.y);
    });
    moveArea.on('pointerup', () => {
      this.joystick.visible = false;
      this.isJoystickActive = false;
    });

    const dashedRectangle = this.createDashedRectangle(x + offset, y, width - offset, height - offset, {
      dashLength: 10,
      gapLength: 10,
      lineWidth: 3,
      color: textColor,
      alpha: 1,
      depth: depth
    });

    this.scene.time.delayedCall(this.dashedTimeout, () => {
      this.scene.tweens.add({
        targets: dashedRectangle,
        alpha: 0,
        duration: 2000,
        ease: 'linear'
      });
    });

    const joystickBase = this.scene.add.image(0, 0, JoystickBaseTexture.key).setScale(0.7).setAlpha(0.6).setDepth(1000);
    const joystickThumb = this.scene.add.image(0, 0, JoystickThumbTexture.key).setScale(0.7).setAlpha(0.6).setDepth(1000);

    this.joystick = new VirtualJoystick(this.scene, {
      x: 200,
      y: 500,
      radius: this.joystickRadius,
      base: joystickBase,
      thumb: joystickThumb,
      forceMin: 0.1,
    });

    this.joystick.on('pointerup', () => {
      this.joystick.visible = false;
      this.isJoystickActive = false;
    });
    this.joystick.on('pointerdown', () => {
      this.joystick.visible = true;
      this.isJoystickActive = true;
    });

    this.joystick.visible = true;
  }

  private createFireArea(): void {
    const x = DISPLAY.WIDTH / 2 + 50;
    const y = DISPLAY.HEIGHT / 2.4;
    const width = DISPLAY.WIDTH - x;
    const height = DISPLAY.HEIGHT - y;
    const depth = 1000;
    const offset = 20;

    const dashedRectangle = this.createDashedRectangle(x, y, width - offset, height - offset, {
      dashLength: 10,
      gapLength: 10,
      lineWidth: 3,
      color: textColor,
      alpha: 1,
      depth: depth
    });

    this.scene.time.delayedCall(this.dashedTimeout, () => {
      this.scene.tweens.add({
        targets: dashedRectangle,
        alpha: 0,
        duration: 2000,
        ease: 'linear'
      });
    });

    const fireArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0, 0);
    fireArea.setDepth(depth);
    fireArea.setInteractive();

    let firePointerTimeout: NodeJS.Timeout;

    const firePointer = this.createPointer(x + width / 2, y + height / 2, fireText.translate);
    fireArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.firePointerPressed = true;
      clearTimeout(firePointerTimeout);
      firePointer.setAlpha(1);
      firePointer.setPosition(pointer.x, pointer.y);

      firePointerTimeout = setTimeout(() => {
        firePointer.setAlpha(0);
      }, 200);

      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: true });
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    });
    fireArea.on('pointerup', () => {
      this.firePointerPressed = false;
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: false });
    });
  }

  private createChangeWeaponArea(): void {
    const x = (DISPLAY.WIDTH / 2) + 50;
    const y = 130;
    const offset = 20;
    const width = DISPLAY.WIDTH - x;
    const height = 150;
    const minSwipeDistance = 50;
    const depth = 1000;
    let swipeStartX = 0;

    const changeWeaponArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0, 0);
    changeWeaponArea.setDepth(1000);
    changeWeaponArea.setInteractive();

    const changeWeaponAreaDashed = this.createDashedRectangle(x, y, width - offset, height, {
      dashLength: 10,
      gapLength: 10,
      lineWidth: 3,
      color: textColor,
      alpha: 1,
      radius: 20,
      depth: depth
    });

    const changeWeaponTextElement = this.scene.add.text(x + width / 2, y + height / 2, changeWeaponText.translate, {
      fontSize: '24px',
      fontFamily: FONT_FAMILY.BOLD,
      color: textColor.toString()
    }).setOrigin(0.5).setDepth(depth).setWordWrapWidth(width - 200).setAlign('center');

    this.scene.time.delayedCall(this.dashedTimeout, () => {
      this.scene.tweens.add({
        targets: [changeWeaponAreaDashed, changeWeaponTextElement],
        alpha: 0,
        duration: 2000,
        ease: 'linear'
      });
    });

    changeWeaponArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      swipeStartX = pointer.x;
    });

    changeWeaponArea.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const swipeDistance = pointer.x - swipeStartX;

      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0) {
          emitEvent(this.scene, Controls.Events.NextWeapon.Event, { playerId: this.playerId });
        } else {
          emitEvent(this.scene, Controls.Events.PrevWeapon.Event, { playerId: this.playerId });
        }
      }
    });

  }

  public destroy(): void {
    this.fireKey.destroy();
    this.reloadKey.destroy();
    this.jumpKey.destroy();
    this.nextWeaponKey.destroy();
    this.prevWeaponKey.destroy();
    this.pauseKey.destroy();
    this.joystick?.destroy();
  }

  public update(time: number, delta: number): void {
    this.handleMovement(time, delta);
    this.handleJump(time, delta);
    this.handleFire(time, delta);
    this.handleReload(time, delta);
    this.handleChangeWeapon(time, delta);
    this.handlePause(time, delta);
    this.handleShop(time, delta);
    this.handleCursorKeys(time, delta);
    this.handleNumberKeys(time, delta);
  }

  private handleNumberKeys(time: number, delta: number): void {
    const numberKeys = [this.key1, this.key2, this.key3, this.key4, this.key5, this.key6, this.key7, this.key8, this.key9];

    numberKeys.forEach((key) => {
      if (key.isDown && !this.numberKeyPressed) {
        this.numberKeyPressed = key.keyCode - 48;
        emitEvent(this.scene, Controls.Events.NumberKey.Event, { playerId: this.playerId, number: this.numberKeyPressed });
      } else if (!key.isDown && this.numberKeyPressed === key.keyCode - 48) {
        this.numberKeyPressed = 0;
      }
    });
  }

  private handleMovement(time: number, delta: number): void {
    const move = { x: 0, y: 0 };

    if (this.isJoystickActive) {
      const joystickX = Math.min(Math.abs(this.joystick.forceX), this.joystickRadius) / this.joystickRadius;
      const joystickY = Math.min(Math.abs(this.joystick.forceY), this.joystickRadius) / this.joystickRadius;

      if (joystickX >= minThreshold) {
        move.x = Math.sign(this.joystick.forceX);
      }
      if (joystickY >= minThreshold) {
        move.y = Math.sign(this.joystick.forceY);
      }
    } else {
      const UpKeyisDown = this.UpKey.isDown || this.cursors.up.isDown;
      const DownKeyisDown = this.DownKey.isDown || this.cursors.down.isDown;
      const LeftKeyisDown = this.LeftKey.isDown || this.cursors.left.isDown;
      const RightKeyisDown = this.RightKey.isDown || this.cursors.right.isDown;

      if (LeftKeyisDown) {
        move.x = -1;
      } else if (RightKeyisDown) {
        move.x = 1;
      }

      if (UpKeyisDown) {
        move.y = -1;
      } else if (DownKeyisDown) {
        move.y = 1;
      }
    }

    emitEvent(this.scene, Controls.Events.Move.Event, { playerId: this.playerId, moveX: move.x, moveY: move.y });
  }

  private handleCursorKeys(time: number, delta: number): void {
    const LeftKeyisDown = this.LeftKey.isDown || this.cursors.left.isDown;
    const RightKeyisDown = this.RightKey.isDown || this.cursors.right.isDown;

    if (LeftKeyisDown && !this.keyLeftDisabled) {
      emitEvent(this.scene, Controls.Events.KeyLeft.Event, { playerId: this.playerId });
      this.keyLeftDisabled = true;
    } else if (!LeftKeyisDown) {
      this.keyLeftDisabled = false;
    }

    if (RightKeyisDown && !this.keyRightDisabled) {
      emitEvent(this.scene, Controls.Events.KeyRight.Event, { playerId: this.playerId });
      this.keyRightDisabled = true;
    } else if (!RightKeyisDown) {
      this.keyRightDisabled = false;
    }
  }

  private handlePause(time: number, delta: number): void {
    if (this.pauseKey.isDown && !this.pauseKeyDisabled) {
      emitEvent(this.scene, Game.Events.Pause.Local, {});
      this.pauseKeyDisabled = true;
    } else if (!this.pauseKey.isDown) {
      this.pauseKeyDisabled = false;
    }
  }

  private handleChangeWeapon(time: number, delta: number): void {
    if (this.nextWeaponKey.isDown || this.prevWeaponKey.isDown) {
      if (this.changeWeaponKeyDisabled) {
        return;
      }
      const direction = this.nextWeaponKey.isDown ? 1 : -1;
      if (direction === 1) {
        emitEvent(this.scene, Controls.Events.NextWeapon.Event, { playerId: this.playerId });
      } else {
        emitEvent(this.scene, Controls.Events.PrevWeapon.Event, { playerId: this.playerId });
      }
      this.changeWeaponKeyDisabled = true;
    } else {
      this.changeWeaponKeyDisabled = false;
    }
  }

  private handleJump(time: number, delta: number): void {
    if (this.jumpKey.isDown && !this.jumpAreaDisabled) {
      emitEvent(this.scene, Controls.Events.Jump.Event, { playerId: this.playerId });
      this.jumpAreaDisabled = true;
    } else if (!this.jumpKey.isDown) {
      this.jumpAreaDisabled = false;
    }
  }

  private handleFire(time: number, delta: number): void {
    if (this.fireKey.isDown || this.firePointerPressed) {
      this.fireKeyPressed = true;
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: true });
    } else if (!this.fireKey.isDown && !this.firePointerPressed) {
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: false });
      this.fireKeyPressed = false;
    }
  }

  private handleReload(time: number, delta: number): void {
    if (this.reloadKey.isDown) {
      emitEvent(this.scene, Controls.Events.Reload.Event, { playerId: this.playerId });
    }
  }

  private handleShop(time: number, delta: number): void {
    if (this.shopKey.isDown && !this.shopKeyDisabled) {
      emitEvent(this.scene, Controls.Events.Shop.Event, { playerId: this.playerId });
      this.shopKeyDisabled = true;
    } else if (!this.shopKey.isDown) {
      this.shopKeyDisabled = false;
    }
  }

  private createDashedRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      dashLength?: number;
      gapLength?: number;
      lineWidth?: number;
      color?: string;
      alpha?: number;
      radius?: number;
      depth?: number;
    } = {}
  ): Phaser.GameObjects.Graphics {
    const {
      dashLength = 10,
      gapLength = 10,
      lineWidth = 3,
      color = dashedColor,
      alpha = 1,
      radius = 20,
      depth = 1000
    } = options;

    const graphics = this.scene.add.graphics();
    graphics.setDepth(depth);
    graphics.lineStyle(lineWidth, hexToNumber(color), alpha);

    // Функция для рисования пунктирной линии между двумя точками
    const drawDashedLine = (startX: number, startY: number, endX: number, endY: number) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dashCount = Math.floor(distance / (dashLength + gapLength));
      const dashRatio = dashLength / (dashLength + gapLength);

      for (let i = 0; i < dashCount; i++) {
        const start = i * (dashLength + gapLength);
        const end = start + dashLength;
        const startRatio = start / distance;
        const endRatio = end / distance;

        const dashStartX = startX + dx * startRatio;
        const dashStartY = startY + dy * startRatio;
        const dashEndX = startX + dx * endRatio;
        const dashEndY = startY + dy * endRatio;

        graphics.moveTo(dashStartX, dashStartY);
        graphics.lineTo(dashEndX, dashEndY);
      }
    };

    // Рисуем закругленные углы
    const drawRoundedCorner = (centerX: number, centerY: number, startAngle: number, endAngle: number) => {
      const segments = 8; // Количество сегментов для закругления
      const angleStep = (endAngle - startAngle) / segments;
      const dashAngleStep = (dashLength / radius) * (Math.PI / 180);
      const gapAngleStep = (gapLength / radius) * (Math.PI / 180);

      for (let i = 0; i < segments; i++) {
        const currentAngle = startAngle + i * angleStep;
        const nextAngle = currentAngle + angleStep;

        if (i % 2 === 0) { // Рисуем только штрихи
          const x1 = centerX + radius * Math.cos(currentAngle);
          const y1 = centerY + radius * Math.sin(currentAngle);
          const x2 = centerX + radius * Math.cos(nextAngle);
          const y2 = centerY + radius * Math.sin(nextAngle);

          graphics.moveTo(x1, y1);
          graphics.lineTo(x2, y2);
        }
      }
    };

    // Рисуем стороны прямоугольника
    // Верхняя сторона
    drawDashedLine(x + radius, y, x + width - radius, y);
    // Правая сторона
    drawDashedLine(x + width, y + radius, x + width, y + height - radius);
    // Нижняя сторона
    drawDashedLine(x + width - radius, y + height, x + radius, y + height);
    // Левая сторона
    drawDashedLine(x, y + height - radius, x, y + radius);

    // Рисуем закругленные углы
    drawRoundedCorner(x + radius, y + radius, Math.PI, Math.PI * 1.5); // Верхний левый
    drawRoundedCorner(x + width - radius, y + radius, Math.PI * 1.5, Math.PI * 2); // Верхний правый
    drawRoundedCorner(x + width - radius, y + height - radius, 0, Math.PI * 0.5); // Нижний правый
    drawRoundedCorner(x + radius, y + height - radius, Math.PI * 0.5, Math.PI); // Нижний левый

    graphics.strokePath();
    return graphics;
  }
}
