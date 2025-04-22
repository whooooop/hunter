import { PlayerEntity } from "../entities/PlayerEntity";

export class KeyBoardController {
  private scene: Phaser.Scene;
  private player: PlayerEntity | null = null;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey: Phaser.Input.Keyboard.Key;
  private reloadKey: Phaser.Input.Keyboard.Key;
  private jumpKey: Phaser.Input.Keyboard.Key;

  private players: Map<string, PlayerEntity>;
  private playerId: string;

  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>, playerId: string) {
    this.scene = scene;
    this.players = players;
    this.playerId = playerId;

    // Настраиваем курсоры для управления
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.fireKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
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

  private handleJump(time: number, delta: number): void {
    // if (this.jumpKey.isDown && !this.isJumping) {
    //   this.startJump();
    // }
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
}
