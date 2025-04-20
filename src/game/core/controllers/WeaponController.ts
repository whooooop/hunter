import { WeaponEntity } from "../entities/WeaponEntity";
import { createWeapon } from "../../weapons";
import { WeaponType } from "../../weapons/WeaponTypes";
import { PlayerEntity } from "../entities/PlayerEntity";
import { createLogger } from "../../../utils/logger";
import { generateId } from "../../../utils/stringGenerator";
import { Player } from "../types/playerTypes";
import { emitEvent, onEvent } from "../Events";
import { ShopEvents } from "../types/shopTypes";
import { WeaponPurchasedPayload } from "../types/shopTypes";

const logger = createLogger('WeaponController');

export class WeaponController {
  private scene: Phaser.Scene;
  private players: Map<string, PlayerEntity>;
  private playerWeapons: Map<string, Map<WeaponType, WeaponEntity>> = new Map();
  private currentWeapon: Map<string, WeaponEntity> = new Map();

  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>) {
    this.scene = scene;
    this.players = players;

    onEvent(this.scene, Player.Events.SetWeapon.Remote, this.setWeaponAction.bind(this));
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased.bind(this));
  }

  private handleWeaponPurchased({ playerId, weaponType }: WeaponPurchasedPayload): void {
    this.setWeapon(playerId, weaponType);
  }


  public getWeapon(playerId: string, weaponType: WeaponType): WeaponEntity {
    if (!this.playerWeapons.has(playerId)) {
      this.playerWeapons.set(playerId, new Map());
    }

    if (!this.playerWeapons.get(playerId)!.has(weaponType)) {
      const id = generateId();
      const weapon = createWeapon(id, weaponType, this.scene);
      this.playerWeapons.get(playerId)!.set(weaponType, weapon);
      return weapon;
    }

    return this.playerWeapons.get(playerId)!.get(weaponType)!;
  }

  private getCurrentWeapon(playerId: string): WeaponEntity {
    return this.currentWeapon.get(playerId)!;
  }

  public setWeapon(playerId: string, weaponType: WeaponType): void {
    emitEvent(this.scene, Player.Events.SetWeapon.Local, { playerId, weaponType });
    this.setWeaponAction({ playerId, weaponType });
  }

  private setWeaponAction({ playerId, weaponType }: Player.Events.SetWeapon.Payload): void {
    const currentWeapon = this.getCurrentWeapon(playerId);

    if (currentWeapon) {
      currentWeapon.setPosition(-2000, - 2000, 1);
    }

    const weapon = this.getWeapon(playerId, weaponType as WeaponType);

    this.currentWeapon.set(playerId, weapon);
    if (this.players.has(playerId)) {
      this.players.get(playerId)!.setWeapon(weapon);
    } else {
      logger.warn('Player not found', playerId);
    }
  }
}