import { PlayerEntity } from "../entities/PlayerEntity";
import { emitEvent } from "../Events";
import { Player } from "../types/playerTypes";

export class KeyBoardController {
  private scene: Phaser.Scene;
  private player: PlayerEntity | null = null;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private changeWeaponKey: Phaser.Input.Keyboard.Key;

  private players: Map<string, PlayerEntity>;
  private playerId: string;

  private changeWeaponKeyDisabled: boolean = false;

  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>, playerId: string) {
    this.scene = scene;
    this.players = players;
    this.playerId = playerId;

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.changeWeaponKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  public update(time: number, delta: number): void {
    if (!this.getPlayer()) {
      return;
    }
    this.handleMovement(time, delta);
    this.handleJump(time, delta);
    this.handleFire(time, delta);
    this.handleReload(time, delta);
    this.handleChangeWeapon(time, delta);
  }

  private handleMovement(time: number, delta: number): void {
    const move = { x: 0, y: 0 };

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
    
    this.getPlayer()?.setMove(move.x, move.y);
  }

  private handleChangeWeapon(time: number, delta: number): void {
    if (this.changeWeaponKey.isDown && !this.changeWeaponKeyDisabled) {
      emitEvent(this.scene, Player.Events.ChangeWeapon.Local, { playerId: this.playerId });
      this.changeWeaponKeyDisabled = true;
    } else if (!this.changeWeaponKey.isDown) {
      this.changeWeaponKeyDisabled = false;
    }
  }

  private handleJump(time: number, delta: number): void {
    if (this.jumpKey.isDown) {
      this.getPlayer()?.jump();
    }
  }

  private handleFire(time: number, delta: number): void {
    if (this.fireKey.isDown) {
      this.getPlayer()?.fireOn();
    } else {
      this.getPlayer()?.fireOff();
    }
  }

  private handleReload(time: number, delta: number): void {
    if (this.reloadKey.isDown) {
      this.getPlayer()?.reload();
    }
  }

  private getPlayer(): PlayerEntity | null {
    return this.players.get(this.playerId) || null;
  }

  public destroy(): void {
    this.fireKey.destroy();
    this.reloadKey.destroy();
    this.jumpKey.destroy();
  }
}
