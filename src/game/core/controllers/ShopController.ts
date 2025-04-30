import { BaseShop } from "../BaseShop";
import { PlayerEntity } from "../entities/PlayerEntity";
import { WeaponType } from "../../weapons/WeaponTypes";
import { UpdateScoreEventPayload } from "../types/scoreTypes";
import { ScoreEvents } from "../types/scoreTypes";
import { offEvent, onEvent } from "../Events";
import { ShopEvents, ShopWeapon, WeaponPurchasedPayload } from "../types/shopTypes";
import { Player } from "../types/playerTypes";

export class ShopController {
  private scene: Phaser.Scene;
  private shop: BaseShop;
  private players: Map<string, PlayerEntity>;
  private playerBalance: Map<string, number> = new Map();
  private playerPurchasedWeapons: Map<string, Set<WeaponType>> = new Map();
  private weapons: ShopWeapon[];
  private isNearbyPlayer: boolean = false;
  private interactablePlayerId: string | null = null;
  private openShopKey: Phaser.Input.Keyboard.Key;
  private currentWeapon: Map<string, string> = new Map();

  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>, playerId: string, shop: BaseShop, weapons: ShopWeapon[]) {
    this.scene = scene;
    this.shop = shop;
    this.players = players;
    this.weapons = weapons;
    this.openShopKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    onEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.handleBalanceUpdate, this);
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    onEvent(this.scene, Player.Events.ChangeWeapon.Local, this.handleChangeWeapon, this);
    onEvent(this.scene, Player.Events.SetWeapon.Local, this.handleSetWeapon, this);
  }

  private handleBalanceUpdate(payload: UpdateScoreEventPayload) {
    this.playerBalance.set(payload.playerId, payload.score);
  }

  private handleSetWeapon(payload: Player.Events.SetWeapon.Payload) {
    this.currentWeapon.set(payload.playerId, payload.weaponType);
  }

  private handleChangeWeapon(payload: Player.Events.ChangeWeapon.Payload) {
    const purchasedWeapons = Array.from(this.playerPurchasedWeapons.get(payload.playerId) || []);
    const currentWeapon = this.currentWeapon.get(payload.playerId);
    const currentWeaponIndex = purchasedWeapons.indexOf(currentWeapon as WeaponType);
    const nextWeapon = purchasedWeapons[currentWeaponIndex + 1];
    if (nextWeapon) {
      
      this.currentWeapon.set(payload.playerId, nextWeapon);
    } else {
      this.currentWeapon.set(payload.playerId, purchasedWeapons[0]);
    }
  }

  private handleWeaponPurchased(payload: WeaponPurchasedPayload) {
    const playerPurchasedWeapons = this.playerPurchasedWeapons.get(payload.playerId) || new Set();
    playerPurchasedWeapons.add(payload.weaponType);
    this.playerPurchasedWeapons.set(payload.playerId, playerPurchasedWeapons);
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
    const playerBalance = this.playerBalance.get(playerId)!;
    const playerPurchasedWeapons = this.playerPurchasedWeapons.get(playerId) || new Set();
    this.shop.openShop(playerId, playerBalance, playerPurchasedWeapons, this.weapons);
  }

  public destroy(): void {
    offEvent(this.scene, ScoreEvents.UpdateScoreEvent, this.handleBalanceUpdate, this);
    offEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
  }
}
