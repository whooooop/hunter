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
import { Game } from "../types/gameTypes";

const logger = createLogger('WeaponController');

export class WeaponController {
  private scene: Phaser.Scene;
  private players: Map<string, PlayerEntity>;
  private playerWeapons: Map<string, Map<WeaponType, WeaponEntity>> = new Map();
  private currentWeapon: Map<string, WeaponEntity> = new Map();
  private weapons: Map<string, { weapon: WeaponEntity, playerId: string, name: WeaponType }> = new Map();
  
  constructor(scene: Phaser.Scene, players: Map<string, PlayerEntity>) {
    this.scene = scene;
    this.players = players;

    onEvent(scene, Game.Events.State.Remote, (payload: Game.Events.State.Payload) => this.handleGameState(payload));
    onEvent(this.scene, Player.Events.SetWeapon.Remote, this.handleSetWeaponActionRemote.bind(this));
    onEvent(this.scene, ShopEvents.WeaponPurchasedEvent, this.handleWeaponPurchased.bind(this));
  }

  private handleWeaponPurchased({ playerId, weaponType }: WeaponPurchasedPayload): void {
    this.setWeapon(playerId, weaponType);
  }

  private handleGameState(payload: Game.Events.State.Payload): void {
    payload.weapons.forEach((weapon) => {
      console.log('init weapon', weapon);
      this.createPlayerWeapon(weapon.weaponId, weapon.playerId, weapon.name as WeaponType);
    });
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

  private getCurrentWeapon(playerId: string): WeaponEntity {
    return this.currentWeapon.get(playerId)!;
  }

  private createPlayerWeapon(weaponId: string, playerId: string, weaponType: WeaponType): WeaponEntity {
    if (!this.playerWeapons.has(playerId)) {
      this.playerWeapons.set(playerId, new Map());
    }

    const weapon = createWeapon(weaponId, weaponType, this.scene);
    this.playerWeapons.get(playerId)!.set(weaponType, weapon);
    this.weapons.set(weaponId, { weapon, playerId, name: weaponType });
    console.log('create weapon', this.playerWeapons);
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