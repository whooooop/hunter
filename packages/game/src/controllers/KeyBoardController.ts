import { StorageSpace } from "@hunter/multiplayer/dist/StorageSpace";
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import { DISPLAY } from "../config";
import { emitEvent } from "../GameEvents";
import { JoystickBaseTexture, JoystickThumbTexture, preloadJoystickTextures } from "../textures/joystick";
import { Game } from "../types/";
import { Controls } from "../types/ControlsTypes";
import { hexToNumber } from "../utils/colors";

export class KeyBoardController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private nextWeaponKey: Phaser.Input.Keyboard.Key;
  private prevWeaponKey: Phaser.Input.Keyboard.Key;
  private pauseKey: Phaser.Input.Keyboard.Key;
  private shopKey: Phaser.Input.Keyboard.Key;
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

  private isMobile: boolean = true;
  private isJoystickActive: boolean = false;


  public static preload(scene: Phaser.Scene): void {
    preloadJoystickTextures(scene);
  }

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly playerId: string,
    private readonly storage: StorageSpace
  ) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.nextWeaponKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.prevWeaponKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shopKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    if (!this.scene.sys.game.device.os.desktop) {
      this.createMobileControls();
    }
  }

  private createMobileControls(): void {
    // fire
    // jump
    // next weapon
    // prev weapon


    // fire area rectangle
    const fireAreaOffsetY = DISPLAY.HEIGHT / 2;
    const fireAreaOffsetX = DISPLAY.WIDTH / 1.5;
    const fireArea = this.scene.add.rectangle(fireAreaOffsetX, fireAreaOffsetY, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - fireAreaOffsetY, hexToNumber('#343434'), 0.4).setOrigin(0, 0);
    fireArea.setDepth(1000);
    fireArea.setAlpha(0.1);
    fireArea.setInteractive();

    // hold
    // fireArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    //   console.log('pointermove', pointer.x, pointer.y);
    // });

    fireArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // this.createButtonGhost(pointer.x, pointer.y, 100);
      console.log('pointerdown', pointer.x, pointer.y);
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: true });
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    });
    fireArea.on('pointerup', () => {
      console.log('pointerup');
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: false });
    });

    // jump area rectangle
    // const jumpAreaOffsetY = DISPLAY.HEIGHT / 2;
    // const jumpAreaOffsetX = DISPLAY.WIDTH / 1.5;
    // const jumpArea = this.scene.add.rectangle(jumpAreaOffsetX, jumpAreaOffsetY, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - jumpAreaOffsetY, hexToNumber('#343434'), 0.4).setOrigin(0, 0);
    // jumpArea.setDepth(1000);
    // jumpArea.setInteractive();
    // jumpArea.on('pointerdown', () => {
    //   console.log('jump area clicked');
    // });


    // next weapon area rectangle

    // right area rectangle
    // const rightArea = this.scene.add.rectangle(0, 0, 100, 100, 0x000000, 1);
    // rightArea.setDepth(1000);

    this.createJoystick();
  }

  private createButtonGhost(x: number, y: number, radius: number): Phaser.GameObjects.Arc {
    const buttonGhost = this.scene.add.circle(x, y, radius, 0x000000);
    buttonGhost.setDepth(1000);
    return buttonGhost;
  }

  private createJoystick(): void {
    const moveAreaOffsetY = 250;
    const moveArea = this.scene.add.rectangle(0, moveAreaOffsetY, DISPLAY.WIDTH / 2, DISPLAY.HEIGHT - moveAreaOffsetY, 0x000000, 0).setOrigin(0, 0);
    moveArea.setDepth(1000);
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

    const joystickBase = this.scene.add.image(0, 0, JoystickBaseTexture.key).setScale(0.7).setAlpha(0.8).setDepth(1000);
    const joystickThumb = this.scene.add.image(0, 0, JoystickThumbTexture.key).setScale(0.7).setAlpha(0.8).setDepth(1000);

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
  }

  private handleMovement(time: number, delta: number): void {
    const move = { x: 0, y: 0 };

    if (this.isJoystickActive) {
      move.x = Math.sign(this.joystick.forceX) * Math.pow(Math.min(Math.abs(this.joystick.forceX), this.joystickRadius) / this.joystickRadius, 1.3);
      move.y = Math.sign(this.joystick.forceY) * Math.pow(Math.min(Math.abs(this.joystick.forceY), this.joystickRadius) / this.joystickRadius, 1.3);
    } else {
      if (this.cursors.left.isDown) {
        move.x = -1;
      } else if (this.cursors.right.isDown) {
        move.x = 1;
      }

      if (this.cursors.up.isDown) {
        move.y = -1;
      } else if (this.cursors.down.isDown) {
        move.y = 1;
      }
    }

    emitEvent(this.scene, Controls.Events.Move.Event, { playerId: this.playerId, moveX: move.x, moveY: move.y });
  }

  private handleCursorKeys(time: number, delta: number): void {
    if (this.cursors.up.isDown && !this.keyUpDisabled) {
      emitEvent(this.scene, Controls.Events.KeyUp.Event, { playerId: this.playerId });
      this.keyUpDisabled = true;
    } else if (!this.cursors.up.isDown) {
      this.keyUpDisabled = false;
    }

    if (this.cursors.down.isDown && !this.keyDownDisabled) {
      emitEvent(this.scene, Controls.Events.KeyDown.Event, { playerId: this.playerId });
      this.keyDownDisabled = true;
    } else if (!this.cursors.down.isDown) {
      this.keyDownDisabled = false;
    }

    if (this.cursors.left.isDown && !this.keyLeftDisabled) {
      emitEvent(this.scene, Controls.Events.KeyLeft.Event, { playerId: this.playerId });
      this.keyLeftDisabled = true;
    } else if (!this.cursors.left.isDown) {
      this.keyLeftDisabled = false;
    }

    if (this.cursors.right.isDown && !this.keyRightDisabled) {
      emitEvent(this.scene, Controls.Events.KeyRight.Event, { playerId: this.playerId });
      this.keyRightDisabled = true;
    } else if (!this.cursors.right.isDown) {
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
    if (this.fireKey.isDown) {
      this.fireKeyPressed = true;
      emitEvent(this.scene, Controls.Events.Fire.Event, { playerId: this.playerId, active: true });
    } else if (this.fireKeyPressed) {
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
}
