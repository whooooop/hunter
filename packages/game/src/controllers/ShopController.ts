import { StorageSpace, SyncCollection } from "@hunter/multiplayer/dist/client";
import { PlayerScoreState, WeaponState } from "@hunter/storage-proto/dist/storage";
import { BaseShop } from "../BaseShop";
import { PlayerEntity } from "../entities/PlayerEntity";
import { playerScoreStateCollection } from "../storage/collections/playerScoreState.collection";
import { weaponStateCollection } from "../storage/collections/weaponState.collection";
import { ShopWeapon } from "../types/shopTypes";
import { WeaponType } from "../weapons/WeaponTypes";


export class ShopController {
  private isNearbyPlayer: boolean = false;
  private interactablePlayerId: string | null = null;
  private openShopKey: Phaser.Input.Keyboard.Key;
  private scoreStore: SyncCollection<PlayerScoreState>;
  private weaponsStore: SyncCollection<WeaponState>;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly players: Map<string, PlayerEntity>,
    private readonly playerId: string,
    private readonly shop: BaseShop,
    private readonly weapons: ShopWeapon[],
    private readonly storage: StorageSpace
  ) {
    this.openShopKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.scoreStore = this.storage.getCollection<PlayerScoreState>(playerScoreStateCollection)!;
    this.weaponsStore = this.storage.getCollection<WeaponState>(weaponStateCollection)!;
  }

  public update(time: number, delta: number) {
    this.updateInteractablePlayerId();
  }

  private updateInteractablePlayerId(): void {
    if (!this.interactablePlayerId) return;

    const player = this.players.get(this.interactablePlayerId);
    if (!player) return;

    const playerPosition = player.getPosition();
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.shop.x, this.shop.y,
      playerPosition[0], playerPosition[1]
    );

    if (distanceToPlayer <= this.shop.getInteractionRadius()) {
      this.shop.setNearbyPlayer(true);
      this.isNearbyPlayer = true;
    } else {
      this.shop.setNearbyPlayer(false);
      this.isNearbyPlayer = false;
    }

    if (this.isNearbyPlayer && this.openShopKey.isDown) {
      this.openShop(this.interactablePlayerId!);
    }
  }

  public setInteractablePlayerId(playerId: string): void {
    this.interactablePlayerId = playerId;
  }

  private openShop(playerId: string): void {
    const playerBalance = this.scoreStore.getItem(playerId)?.value || 0;
    const playerWeapons = new Set<WeaponType>();

    this.weaponsStore.forEach((record) => {
      if (record.data.playerId === playerId) {
        playerWeapons.add(record.data.type as WeaponType);
      }
    });

    this.shop.openShop(playerId, playerBalance, playerWeapons, this.weapons);
  }

  public destroy(): void { }
}
