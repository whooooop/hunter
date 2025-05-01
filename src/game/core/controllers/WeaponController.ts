import { WeaponEntity } from "../entities/WeaponEntity";
import { createWeapon } from "../../weapons";
import { WeaponType } from "../../weapons/WeaponTypes";
import { PlayerEntity } from "../entities/PlayerEntity";
import { createLogger } from "../../../utils/logger";
import { generateId } from "../../../utils/stringGenerator";
import { Player } from "../types/playerTypes";
import { emitEvent, offEvent, onEvent } from "../Events";
import { ShopEvents } from "../types/shopTypes";
import { WeaponPurchasedPayload } from "../types/shopTypes";
import { Game } from "../types/gameTypes";

const logger = createLogger('WeaponController');

export class WeaponController {
  private scene: Phaser.Scene;
  private players: Map<string, PlayerEntity>;
  private playerWeapons: Map<string, Map<WeaponType, WeaponEntity>> = new Map();
  private currentWeapon: Map<string, { entity: WeaponEntity, type: WeaponType }> = new Map();
  private weapons: Map<string, { weapon: WeaponEntity, playerId: string, name: WeaponType }> = new Map();
  
  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>) {
    this.scene = scene;
    this.players = players;

    onEvent(scene, Game.Events.State.Remote, this.handleGameState, this);
    onEvent(scene, Player.Events.SetWeapon.Remote, this.handleSetWeaponActionRemote, this);
    onEvent(scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    onEvent(scene, Player.Events.ChangeWeapon.Local, this.handleChangeWeapon, this);
  }

  private handleWeaponPurchased({ playerId, weaponType }: WeaponPurchasedPayload): void {
    this.setWeapon(playerId, weaponType);
  }

  private handleGameState(payload: Game.Events.State.Payload): void {
    payload.weapons.forEach((weapon) => {
      this.createPlayerWeapon(weapon.weaponId, weapon.playerId, weapon.name as WeaponType);
    });
  }

  private handleChangeWeapon({ playerId, direction }: Player.Events.ChangeWeapon.Payload): void {
    const currentWeapon = this.getCurrentWeapon(playerId);
    const playerWeapons = Array.from(this.playerWeapons.get(playerId)?.keys() || []);

    if (currentWeapon) {
      const currentWeaponIndex = playerWeapons.indexOf(currentWeapon.type);
      const nextWeapon = playerWeapons[currentWeaponIndex + direction];
      if (nextWeapon) {
        this.setWeapon(playerId, nextWeapon);
      } else {
        if (direction === 1) {
          this.setWeapon(playerId, playerWeapons[0]);
        } else {
          this.setWeapon(playerId, playerWeapons[playerWeapons.length - 1]);
        }
      }
    }
  }

  private handleSetWeaponActionRemote({ playerId, weaponId, weaponType }: Player.Events.SetWeapon.Payload): void {
    const weapon = this.getPlayerWeapon(playerId, weaponType);
    if (!weapon) {
      this.createPlayerWeapon(weaponId, playerId, weaponType);
    } 
    // this.setWeaponAction({ playerId, weaponId, weaponType });
  }

  private getPlayerWeapon(playerId: string, weaponType: WeaponType): WeaponEntity | undefined {
    return this.playerWeapons.get(playerId)?.get(weaponType);
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

  private getCurrentWeapon(playerId: string): { entity: WeaponEntity, type: WeaponType } | undefined {
    return this.currentWeapon.get(playerId);
  }

  private createPlayerWeapon(weaponId: string, playerId: string, weaponType: WeaponType): WeaponEntity {
    if (!this.playerWeapons.has(playerId)) {
      this.playerWeapons.set(playerId, new Map());
    }

    const weapon = createWeapon(weaponId, weaponType, this.scene);
    this.playerWeapons.get(playerId)!.set(weaponType, weapon);
    this.weapons.set(weaponId, { weapon, playerId, name: weaponType });
    return weapon;
  }

  public setWeapon(playerId: string, weaponType: WeaponType): void {
    const weaponId = generateId();
    const weapon = this.getPlayerWeapon(playerId, weaponType);
    if (!weapon) {
      this.createPlayerWeapon(weaponId, playerId, weaponType);
    } 
    emitEvent(this.scene, Player.Events.SetWeapon.Local, { playerId, weaponId, weaponType });
    this.setWeaponAction({ playerId, weaponId, weaponType });
  }
  
  public setWeaponById({ playerId, weaponId }: Omit<Player.Events.SetWeapon.Payload, 'weaponType'>): void {
    const weapon = this.weapons.get(weaponId);

    if (weapon) {
      this.setWeaponAction({ playerId, weaponId, weaponType: weapon.name });
    }
  }

  public setWeaponAction({ playerId, weaponType }: Player.Events.SetWeapon.Payload): void {
    const currentWeapon = this.getCurrentWeapon(playerId);

    if (currentWeapon) {
      currentWeapon.entity.setPosition(-2000, - 2000, 1);
    }

    const weapon = this.getWeapon(playerId, weaponType as WeaponType);

    this.currentWeapon.set(playerId, { entity: weapon, type: weaponType as WeaponType });
    if (this.players.has(playerId)) {
      this.players.get(playerId)!.setWeapon(weapon);
    } else {
      logger.warn('Player not found', playerId);
    }
  }

  public destroy(): void {
    offEvent(this.scene, Game.Events.State.Remote, this.handleGameState, this);
    offEvent(this.scene, Player.Events.SetWeapon.Remote, this.handleSetWeaponActionRemote, this);
    offEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased, this);
    offEvent(this.scene, Player.Events.ChangeWeapon.Local, this.handleChangeWeapon, this);
  }
}