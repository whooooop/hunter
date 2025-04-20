import { BaseShop } from "../BaseShop";
import { PlayerEntity } from "../entities/PlayerEntity";
import { WeaponType } from "../../weapons/WeaponTypes";
import { UpdateScoreEventPayload } from "../types/scoreTypes";
import { ScoreEvents } from "../types/scoreTypes";
import { onEvent } from "../Events";
import { ShopEvents, ShopWeapon, WeaponPurchasedPayload } from "../types/shopTypes";

export class ShopController {
  private scene: Phaser.Scene;
  private shop: BaseShop;
  private players: Map<string, PlayerEntity>;
  private playerBalance: Map<string, number> = new Map();
  private playerPurchasedWeapon: Map<string, Set<WeaponType>> = new Map();
  private weapons: ShopWeapon[];
  private isNearbyPlayer: boolean = false;
  private interactablePlayerId: string | null = null;
  private openShopKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>, shop: BaseShop, weapons: ShopWeapon[]) {
    this.scene = scene;
    this.shop = shop;
    this.players = players;
    this.weapons = weapons;
    this.openShopKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.handleBalanceUpdate, this);
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
  }

  private handleBalanceUpdate(payload: UpdateScoreEventPayload) {
    this.playerBalance.set(payload.playerId, payload.score);
  }

  private handleWeaponPurchased(payload: WeaponPurchasedPayload) {
    const playerPurchasedWeapons = this.playerPurchasedWeapon.get(payload.playerId) || new Set();
    playerPurchasedWeapons.add(payload.weaponType);
    this.playerPurchasedWeapon.set(payload.playerId, playerPurchasedWeapons);
  }

  public update(time: number, delta: number) {
    this.updateInteractablePlayerId();
  }

  private updateInteractablePlayerId(): void {
    if (!this.interactablePlayerId) return;

    const player = this.players.get(this.interactablePlayerId)!;
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
    const playerBalance = this.playerBalance.get(playerId)!;
    const playerPurchasedWeapons = this.playerPurchasedWeapon.get(playerId) || new Set();
    this.shop.openShop(playerId, playerBalance, playerPurchasedWeapons, this.weapons);
  }
}
