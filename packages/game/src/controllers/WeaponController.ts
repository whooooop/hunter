import { StorageSpace, SyncCollectionRecord } from "@hunter/multiplayer/dist/client";
import { PlayerWeapon, WeaponState } from "@hunter/storage-proto/dist/storage";
import { PlayerEntity } from "../entities/PlayerEntity";
import { WeaponEntity } from "../entities/WeaponEntity";
import { onEvent } from "../GameEvents";
import { playerWeaponCollection } from "../storage/collections/playerWeapon.collection";
import { weaponStateCollection } from "../storage/collections/weaponState.collection";
import { Player, ShopEvents, WeaponPurchasedPayload } from "../types";
import { createLogger } from "../utils/logger";
import { generateId } from "../utils/stringGenerator";
import { createWeapon } from "../weapons";
import { WeaponType } from "../weapons/WeaponTypes";

const logger = createLogger('WeaponController');

export class WeaponController {
  private playerWeapons: Map<string, Map<string, WeaponEntity>> = new Map();
  private currentWeapon: Map<string, string> = new Map();
  private weapons: Map<string, WeaponEntity> = new Map();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly players: Map<string, PlayerEntity>,
    private readonly storage: StorageSpace,
    private readonly playerId: string
  ) {
    onEvent(scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    onEvent(scene, Player.Events.ChangeWeapon.Local, this.handleChangeWeapon, this);

    this.storage.on<WeaponState>(weaponStateCollection, 'Add', this.addPlayerWeapon.bind(this));
    this.storage.on<PlayerWeapon>(playerWeaponCollection, 'Add', this.updatePlayerCurrentWeapon.bind(this));
    this.storage.on<PlayerWeapon>(playerWeaponCollection, 'Update', this.updatePlayerCurrentWeapon.bind(this));
  }

  private handleWeaponPurchased({ playerId, weaponType }: WeaponPurchasedPayload): void {
    const weaponId = generateId();
    this.storage.getCollection<WeaponState>(weaponStateCollection)!.addItem(weaponId, {
      playerId,
      type: weaponType,
    });
    this.storage.getCollection<PlayerWeapon>(playerWeaponCollection)!.updateItem(playerId, {
      weaponId
    });
  }

  private addPlayerWeapon(weaponId: string, record: SyncCollectionRecord<WeaponState>): void {
    if (!this.playerWeapons.has(record.data.playerId)) {
      this.playerWeapons.set(record.data.playerId, new Map());
    }

    const playerWeapons = this.playerWeapons.get(record.data.playerId)!;
    const weaponType = record.data.type as WeaponType;
    const weaponEntity = createWeapon(weaponId, weaponType, this.scene, record.data.playerId, this.storage, this.playerId === record.data.playerId);

    playerWeapons.set(weaponId, weaponEntity);
    this.weapons.set(weaponId, weaponEntity);
  }

  private handleChangeWeapon({ playerId, direction }: Player.Events.ChangeWeapon.Payload): void {
    const currentWeaponId = this.getCurrentWeapon(playerId);
    const playerWeapons = Array.from(this.playerWeapons.get(playerId)?.keys() || []);

    if (!currentWeaponId) return;

    const currentWeaponIndex = playerWeapons.indexOf(currentWeaponId);
    let nextWeapon = playerWeapons[currentWeaponIndex + direction];
    if (!nextWeapon) {
      if (direction === 1) {
        nextWeapon = playerWeapons[0];
      } else {
        nextWeapon = playerWeapons[playerWeapons.length - 1];
      }
    }

    this.storage.getCollection<PlayerWeapon>(playerWeaponCollection)!.updateItem(playerId, {
      weaponId: nextWeapon
    });
  }

  private getPlayerWeapon(playerId: string, weaponType: WeaponType): WeaponEntity | undefined {
    return this.playerWeapons.get(playerId)?.get(weaponType);
  }

  public getWeapon(weaponId: string): WeaponEntity {
    return this.weapons.get(weaponId)!;
  }

  public getCurrentWeapon(playerId: string): string | undefined {
    return this.currentWeapon.get(playerId);
  }

  private setCurrentWeapon(playerId: string, weaponId: string): void {
    this.currentWeapon.set(playerId, weaponId);
  }

  public setWeapon(playerId: string, weaponId: string): void {
    const currentWeaponId = this.getCurrentWeapon(playerId);
    const player = this.players.get(playerId);
    if (!player) {
      return;
    }

    if (currentWeaponId === weaponId) {
      return;
    }

    if (currentWeaponId) {
      // const currentWeapon = this.getWeapon(currentWeaponId);
      // if (currentWeapon) {
      //   currentWeapon.hide();
      // }
    }

    const weapon = this.getWeapon(weaponId);
    this.setCurrentWeapon(playerId, weaponId);
    this.players.get(playerId)!.setWeapon(weapon);
  }

  private updatePlayerCurrentWeapon(playerId: string, record: SyncCollectionRecord<PlayerWeapon>): void {
    this.setWeapon(playerId, record.data.weaponId);
  }

  public destroy(): void {
    // offEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    // offEvent(this.scene, Player.Events.ChangeWeapon.Local, this.handleChangeWeapon, this);
  }
}