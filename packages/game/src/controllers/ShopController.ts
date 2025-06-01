import { StorageSpace, SyncCollection } from "@hunter/multiplayer/dist/client";
import { PlayerScoreState, WeaponState } from "@hunter/storage-proto/dist/storage";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ShopEntity } from "../entities/ShopEntity";
import { emitEvent, offEvent, onEvent } from "../GameEvents";
import { playerScoreStateCollection } from "../storage/collections/playerScoreState.collection";
import { weaponStateCollection } from "../storage/collections/weaponState.collection";
import { Controls } from "../types/ControlsTypes";
import { ShopWeapon } from "../types/shopTypes";
import { UiShopButton } from "../ui/ShopButton";
import { WeaponType } from "../weapons/WeaponTypes";


export class ShopController {
  private isNearbyPlayer: boolean = false;
  private interactablePlayerId: string | null = null;
  private scoreStore: SyncCollection<PlayerScoreState>;
  private weaponsStore: SyncCollection<WeaponState>;
  protected shopButton!: UiShopButton;

  static preload(scene: Phaser.Scene): void {
    UiShopButton.preload(scene);
  }

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly players: Map<string, PlayerEntity>,
    private readonly playerId: string,
    private readonly shop: ShopEntity,
    private readonly weapons: ShopWeapon[],
    private readonly storage: StorageSpace
  ) {
    this.scoreStore = this.storage.getCollection<PlayerScoreState>(playerScoreStateCollection)!;
    this.weaponsStore = this.storage.getCollection<WeaponState>(weaponStateCollection)!;

    onEvent(this.scene, Controls.Events.Shop.Event, this.toggleShop, this);

    this.createInteractionIcon();
  }

  /**
   * Создает иконку взаимодействия над магазином
   */
  protected createInteractionIcon(): void {
    this.shopButton = new UiShopButton(this.scene, 50, 90);
    this.shopButton.setAlpha(0);
    this.shopButton.on('pointerup', () => {
      emitEvent(this.scene, Controls.Events.Shop.Event, { playerId: this.playerId });
    }).setDepth(900);
    this.scene.add.existing(this.shopButton);
  }

  /**
   * Показывает подсказку для взаимодействия
   */
  public showInteractionPrompt(): void {
    if (!this.shopButton || !this.scene) return;
    this.shopButton.setAlpha(1);
  }

  /**
   * Скрывает подсказку для взаимодействия
   */
  public hideInteractionPrompt(): void {
    if (!this.shopButton || !this.scene) return;
    this.shopButton.setAlpha(0);
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
      this.showInteractionPrompt();
    } else {
      this.shop.setNearbyPlayer(false);
      this.isNearbyPlayer = false;
      this.hideInteractionPrompt();
    }

    // if (this.isNearbyPlayer && this.openShopKey.isDown) {
    //   this.openShop(this.interactablePlayerId!);
    // }
  }

  private toggleShop({ playerId }: Controls.Events.Shop.Payload): void {
    if (playerId !== this.playerId) return;
    if (this.isNearbyPlayer && !this.shop.getIsShopOpen()) {
      this.openShop(playerId);
    } else {
      this.closeShop();
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

  private closeShop(): void {
    this.shop.closeShop();
  }

  public destroy(): void {
    offEvent(this.scene, Controls.Events.Shop.Event, this.toggleShop, this);
  }
}
