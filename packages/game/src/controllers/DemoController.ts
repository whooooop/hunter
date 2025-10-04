import { StorageSpace } from "@hunter/multiplayer";
import { PlayerSkin } from "@hunter/storage-proto/src/storage";
import { DISPLAY } from "../config";
import { EnemyEntity } from "../entities/EnemyEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { emitEvent } from "../GameEvents";
import { playerSkinCollection } from "../storage/collections/playerSkin.collection";
import { playerStateCollection } from "../storage/collections/playerState.collection";
import { Player, ShopEvents } from "../types";
import { WeaponType } from "../weapons/WeaponTypes";

export class DemoController {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly storage: StorageSpace,
    private readonly players: Map<string, PlayerEntity>,
    private readonly enemies: Map<string, EnemyEntity>,
  ) {

    const actions = [
      { type: 'move', weight: 2, move: [1, 0] },
      { type: 'move', weight: 2, move: [-1, 0] },
      { type: 'move', weight: 5, move: [0, 1] },
      { type: 'move', weight: 5, move: [0, -1] },
      { type: 'move', weight: 1, move: [1, 1] },
      { type: 'move', weight: 1, move: [-1, 1] },
      { type: 'move', weight: 1, move: [1, -1] },
      { type: 'move', weight: 1, move: [-1, -1] },
      { type: 'move', weight: 10, move: [0, 0] },
      { type: 'enemy', weight: 30 },
      { type: 'nearest', weight: 20 },
      { type: 'fire', weight: 30 },
      { type: 'jump', weight: 1 },
      { type: 'wait', weight: 5 }
    ].reduce((acc: any[], item: any) => {
      acc.push(...Array(item.weight).fill(item));
      return acc;
    }, []);
    const demoPlayers = [
      { id: 'DEMO_PLAYER_1', skin: 'b2', weapon: WeaponType.GLOCK },
      { id: 'DEMO_PLAYER_2', skin: 'b3', weapon: WeaponType.REVOLVER },
      { id: 'DEMO_PLAYER_3', skin: 'b4', weapon: WeaponType.MP5 },
      { id: 'DEMO_PLAYER_4', skin: 'b5', weapon: WeaponType.SAWED },
      { id: 'DEMO_PLAYER_5', skin: 'b6', weapon: WeaponType.M4 },
    ]
    demoPlayers.forEach(({ id, skin, weapon }) => {
      this.storage.getCollection<PlayerSkin>(playerSkinCollection)!.addItem(id, { body: skin });
      this.storage.getCollection<Player.State>(playerStateCollection)!.addItem(id, { x: 0, y: 0, vx: 0, vy: 0 });
      emitEvent(this.scene, ShopEvents.WeaponPurchasedEvent, { playerId: id, weaponType: weapon, price: 0 });

      setTimeout(() => {
        this.storage.getCollection<Player.State>(playerStateCollection)!.getItemRecord(id)!.readonly = false;
      }, 1000);
    });


    setInterval(() => {
      demoPlayers.forEach(({ id }) => {
        this.reloadWeaponIfAmmoIsLow(id);
        this.correctPlayerPosition(id);

        const action = actions[Math.floor(Math.random() * actions.length)];
        const player = this.players.get(id);
        if (player) {
          switch (action.type) {
            case 'jump':
              this.jump(id);
              break;
            case 'fire':
              this.fire(id);
              break;
            case 'move':
              this.move(id, action.move![0], action.move![1]);
              break;
            case 'enemy':
              this.moveToEnemy(id);
              break;
            case 'nearest':
              this.moveToNearestEnemy(id);
              break;
          }
        }
      });
    }, 50);
  }

  fire(playerId: string): void {
    const player = this.players.get(playerId);
    player?.fireOn();
    setTimeout(() => {
      player?.fireOff();
    }, 100);
  }

  jump(playerId: string): void {
    const player = this.players.get(playerId);
    player?.jump();
  }

  move(playerId: string, moveX: number, moveY: number): void {
    const player = this.players.get(playerId);
    player?.setMove(moveX, moveY);
  }

  moveToEnemy(playerId: string): void {
    const player = this.players.get(playerId);
    const enemy = Array.from(this.enemies.values())[Math.floor(Math.random() * this.enemies.size)] as EnemyEntity;
    if (!enemy) return;
    const enemyPos = enemy.getPosition();
    if (!enemyPos) return;
    player?.setMove(0, Math.sign(enemyPos.y - player.getPosition()[1]));
  }

  moveToNearestEnemy(playerId: string): void {
    const player = this.players.get(playerId)!;
    const position = player.getPosition()!;
    const ePos: number[] = [];
    let nearestPos: { x: number, y: number } | null = null;
    this.enemies.forEach(enemy => {
      if (enemy instanceof EnemyEntity) {
        const pos = enemy.getPosition();
        if (!nearestPos || nearestPos.x > pos.x) {
          nearestPos = pos;
        }
        ePos.push(pos.y);
      }
    });
    if (nearestPos) {
      player.setMove(
        Math.sign((nearestPos as { x: number, y: number }).x - position[0]),
        Math.sign((nearestPos as { x: number, y: number }).y - position[1])
      );
    }
  }

  reloadWeaponIfAmmoIsLow(playerId: string): void {
    const player = this.players.get(playerId);
    const weapon = player?.getWeapon();
    if (weapon && weapon.getCurrentAmmo() === 0) {
      player?.reload();
    }
  }

  correctPlayerPosition(playerId: string): void {
    const player = this.players.get(playerId);
    const position = player?.getPosition();

    if (position && position[0] < 50) {
      player?.setMove(1, 0);
    } else if (position && position[0] > DISPLAY.WIDTH / 2) {
      player?.setMove(-1, 0);
    }
  }
}